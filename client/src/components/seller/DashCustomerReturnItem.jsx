import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Breadcrumb,
  TextInput,
  Modal,
  Alert,
  Pagination,
} from "flowbite-react";
import { HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Label } from "flowbite-react";
import Select from "react-select";
import { HiInformationCircle } from "react-icons/hi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DashCustomerReturnItem() {
  const { currentUser } = useSelector((state) => state.user);
  const [sales, setSales] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReturnItems, setFilteredReturnItems] = useState([]);
  const [returnDateTime, setReturnDateTime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState("");
  const [billIds, setBillIds] = useState([]);
  const [billDetailsMap, setBillDetailsMap] = useState({});
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);
  const [returnCounts, setReturnCounts] = useState({});
  const [returnReasons, setReturnReasons] = useState({});
  const [returnAlert, setReturnAlert] = useState(false);
  const [show7DayAlert, setShow7DayAlert] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(returnItems.length / itemsPerPage);

  const onPageChange = (page) => setCurrentPage(page);

  const currentData = filteredReturnItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Determine if the filter is active
  const isFilterActive = searchQuery.length > 0 || returnDateTime !== null;

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle date input change
  const handleDateChange = (e) => {
    setReturnDateTime(e.target.value);
  };

  // Handle bill selection
  const handleBillSelection = (selectedOption) => {
    setSelectedBillId(selectedOption);
    setSelectedReturnItems([]);
    setReturnCounts({});
    const billId = selectedOption.value;
    const buyDateTime = billDetailsMap[billId][0].buyDateTime;
    setShow7DayAlert(!isWithinReturnPeriod(buyDateTime)); // Update alert state based on date check
  };

  // Handle return item selection for a specific dropdown index
  const handleReturnItemSelection = (selectedOption, index) => {
    setSelectedReturnItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index] = selectedOption ? selectedOption.value : null;
      return newItems;
    });
  };

  // Handle return count change
  const handleReturnCountChange = (count) => {
    setReturnCounts(parseInt(count));
    console.log(returnCounts);
  };

  // Handle return reason change
  const handleReturnReasonChange = (reason, index) => {
    setReturnReasons((prevReasons) => ({
      ...prevReasons,
      [index]: reason,
    }));
  };

  // Helper function to check if the return is within 14 days
  const isWithinReturnPeriod = (buyDate) => {
    const buyDateTime = new Date(buyDate).getTime();
    const currentDateTime = new Date().getTime();
    const diffInDays = (currentDateTime - buyDateTime) / (1000 * 3600 * 24);
    return diffInDays <= 7;
  };

  // Handle add return
  const handleAddReturn = async () => {
    try {
      // Validate data
      const returnItemsWithCounts = selectedReturnItems.map(
        (returnItem, index) => {
          const item = billDetailsMap[selectedBillId.value][index];
          return {
            customerId: item.customerId,
            itemId: item.itemId,
            shopId: item.shopId,
            returnDateTime: new Date().toISOString(),
            buyDateTime: item.buyDateTime,
            reason: returnReasons[index] || "No reason specified",
            quantity: returnCounts || 0,
          };
        }
      );

      const res = await fetch(
        `/api/customerreturnitem/addcustomerreturnitems`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(returnItemsWithCounts),
        }
      );

      const data = await res.json();

      if (res.ok) {
        //alert(data.message);
        setShowError(false);
        setShow7DayAlert(false);
        setReturnAlert(true);
        setIsSubmitted(true);
        // setIsModalOpen(false);
        const fetchShopId = async () => {
          try {
            const res = await fetch(`/api/shop/getshop/${currentUser.id}`);
            const data = await res.json();
            if (res.ok) {
              if (Array.isArray(data.shops) && data.shops.length > 0) {
                const shopId = data.shops[0].id;
                fetchReturnItemsbyShopId(shopId);
                fetchSalesByShopId(shopId);
              } else {
                console.error("No shops found for the current user.");
              }
            } else {
              console.error("API response error:", data);
            }
          } catch (error) {
            console.error("Error fetching shop ID:", error);
          }
        };
        handleAddReturnToBuyItemTable();
        fetchShopId();
      } else {
        //alert(data.message);
        setShowError(true);
      }
    } catch (error) {
      console.error("Error adding return items:", error);
    }
  };

  //handle add return to byitemtable
  const handleAddReturnToBuyItemTable = async () => {
    try {
      const returnItemsWithCounts = selectedReturnItems.map(
        (returnItem, index) => {
          const item = billDetailsMap[selectedBillId.value][index];
          return {
            customerId: item.customerId,
            itemId: item.itemId,
            shopId: item.shopId,
            buyDateTime: item.buyDateTime,
            unitPrice: item.unitPrice,
            type: "Cash",
            quantity: -1 * returnCounts || 0,
            dueAmount: 0,
          };
        }
      );

      const res = await fetch(`/api/sales-report/addsales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnItemsWithCounts),
      });
    } catch (error) {
      console.error("Error adding return items:", error);
    }
  };

  // Add another dropdown for return item selection
  const addAnotherReturnItem = () => {
    if (
      selectedReturnItems.length < billDetailsMap[selectedBillId.value].length
    ) {
      setSelectedReturnItems([...selectedReturnItems, null]);
    } else {
      alert(
        "You cannot add more return items than the available items in the bill."
      );
    }
  };

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await fetch("api/sales-report/getsales");
      const data = await res.json();
      if (res.ok) {
        // Group sales by customerId, shopId, and buyDateTime
        const groupedSales = groupSales(data.sales);
        const generatedBillIds = groupedSales.map(generateBillId);
        const billDetailsMap = generateBillDetailsMap(groupedSales);
        setSales(groupedSales);
        setBillIds(generatedBillIds);
        setBillDetailsMap(billDetailsMap);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Fetch sales by shop ID
  const fetchSalesByShopId = async (shopId) => {
    try {
      const res = await fetch(`api/sales-report/getsales/${shopId}`);
      const data = await res.json();
      if (res.ok) {
        // Group sales by customerId, shopId, and buyDateTime
        const groupedSales = groupSales(data.sales);
        const generatedBillIds = groupedSales.map(generateBillId);
        const billDetailsMap = generateBillDetailsMap(groupedSales);
        setSales(groupedSales);
        setBillIds(generatedBillIds);
        setBillDetailsMap(billDetailsMap);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Function to group sales by customerId, shopId, and buyDateTime
  const groupSales = (sales) => {
    const groupedSales = {};
    sales.forEach((sale) => {
      const key = `${sale.customerId}-${sale.shopId}-${sale.buyDateTime}`;
      if (!groupedSales[key]) {
        groupedSales[key] = [sale];
      } else {
        groupedSales[key].push(sale);
      }
    });
    return Object.values(groupedSales);
  };

  // Function to generate bill ID
  const generateBillId = (bill) => {
    const { customerId, shopId, buyDateTime } = bill[0];
    const formattedDate = new Date(buyDateTime)
      .toLocaleDateString()
      .replace(/\//g, "-");
    const formattedTime = new Date(buyDateTime)
      .toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/:/g, "");
    return `BILL-${customerId}-${shopId}-${formattedDate}-${formattedTime}`;
  };

  const generateBillDetailsMap = (groupedSales) => {
    const billDetailsMap = {};
    groupedSales.forEach((bill) => {
      const billId = generateBillId(bill);
      billDetailsMap[billId] = bill;
    });
    return billDetailsMap;
  };

  // Fetch return items by shop ID
  const fetchReturnItemsbyShopId = async (shopId) => {
    try {
      const res = await fetch(
        `/api/customerreturnitem/getreturnsbyshop/${shopId}`
      );
      const data = await res.json();
      if (res.ok) {
        setReturnItems(data.sales);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // Fetch return items
  const fetchReturnItems = async () => {
    try {
      const res = await fetch(`/api/customerreturnitem/getreturns`);
      const data = await res.json();
      if (res.ok) {
        setReturnItems(data.sales);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter return items based on search query and return date
  useEffect(() => {
    if (isFilterActive) {
      setFilteredReturnItems(
        returnItems.filter((item) => {
          const searchTerms = searchQuery.toLowerCase().split(" ");

          const matchesName =
            searchTerms.length === 2
              ? item.Customer.firstname
                  .toLowerCase()
                  .includes(searchTerms[0]) &&
                item.Customer.lastname.toLowerCase().includes(searchTerms[1])
              : item.Customer.firstname
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                item.Customer.lastname
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());

          const matchesSearchQuery =
            matchesName ||
            item.Product.itemName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            item.quantity.toString().includes(searchQuery.toLowerCase()) ||
            item.BuyItem.unitPrice
              .toString()
              .includes(searchQuery.toLowerCase()) ||
            item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.BuyItem.unitPrice * item.quantity)
              .toString()
              .includes(searchQuery.toLowerCase());

          // Check if return date matches
          const matchesReturnDate = returnDateTime
            ? new Date(item.returnDateTime).toISOString().split("T")[0] ===
              returnDateTime
            : true;

          return matchesSearchQuery && matchesReturnDate;
        })
      );
    } else {
      setFilteredReturnItems(returnItems);
    }
  }, [searchQuery, returnDateTime, returnItems]);

  // Fetch return items based on user role
  useEffect(
    () => {
      if (
        currentUser.role === "Admin" ||
        currentUser.role === "Accountant" ||
        currentUser.role === "Director"
      ) {
        fetchReturnItems();
        fetchSales();
      } else if (currentUser.role === "Seller") {
        const fetchShopId = async () => {
          try {
            const res = await fetch(`/api/shop/getshop/${currentUser.id}`);
            const data = await res.json();
            if (res.ok) {
              if (Array.isArray(data.shops) && data.shops.length > 0) {
                const shopId = data.shops[0].id;
                fetchReturnItemsbyShopId(shopId);
                fetchSalesByShopId(shopId);
              } else {
                console.error("No shops found for the current user.");
              }
            } else {
              console.error("API response error:", data);
            }
          } catch (error) {
            console.error("Error fetching shop ID:", error);
          }
        };

        fetchShopId();
      }
    },
    [currentUser],
    [returnItems]
  );

  // Export to Excel
  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const exportItems = filteredReturnItems.map((item) => ({
      "Customer Name": `${item.Customer.firstname} ${item.Customer.lastname}`,
      "Product Name": item.Product.itemName,
      Quantity: item.quantity,
      "Sold Price": item.BuyItem.unitPrice,
      "Buy Date Time": new Date(item.buyDateTime).toLocaleString(),
      "Return Date Time": new Date(item.returnDateTime).toLocaleString(),
      Reason: item.reason,
      "Amount Refunded": item.BuyItem.unitPrice * item.quantity,
    }));

    const ws = XLSX.utils.json_to_sheet(exportItems);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    //get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[-T:\.Z]/g, "");
    const fileName = `ReturnItems_${formattedDate}${fileExtension}`;
    saveAs(
      new Blob([excelBuffer], { type: fileType }),
      fileName + fileExtension
    );
  };

  //console.log(returnCounts);

  return (
    <div className="p-3 w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumb aria-label="Default breadcrumb example">
            <Link to="/dashboard?tab=dash">
              <Breadcrumb.Item href="" icon={HiHome}>
                Home
              </Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item>Return Items</Breadcrumb.Item>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
              Return Items : Report
            </h1>

            <Button color="blue" onClick={exportToExcel} className="h-10  ml-2">
              Export to Excel
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <TextInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search"
                className="w-full md:w-52 h-10 mb-2 md:mb-0 md:mr-2"
              />
              <div className="flex items-center space-x-2">
                <Label>Filter by Return Date</Label>
                <TextInput
                  id="date"
                  type="date"
                  value={returnDateTime || ""}
                  onChange={handleDateChange}
                  className="w-full md:w-48 h-10 mb-2 md:mb-0 md:mr-2"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                // style={{ backgroundColor: "red" }}
                onClick={() => setIsModalOpen(true)}
                className="h-10 w-32 ml-2 bg-red-500 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-700"
                style={{
                  display:
                    currentUser.role === "Accountant" ||
                    currentUser.role === "Director" ||
                    currentUser.role === "Admin"
                      ? "none"
                      : "inline-block",
                }}
              >
                Add Retuns
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {returnItems.length > 0 ? (
              <>
                <Table hoverable className="shadow-md w-full">
                  <TableHead>
                    <TableHeadCell>Customer Name</TableHeadCell>
                    <TableHeadCell>Product Name</TableHeadCell>
                    <TableHeadCell>Quantity</TableHeadCell>
                    <TableHeadCell>Sold Price</TableHeadCell>
                    <TableHeadCell>Buy Date Time</TableHeadCell>
                    <TableHeadCell>Return Date Time</TableHeadCell>
                    <TableHeadCell>Reason</TableHeadCell>
                    <TableHeadCell>Amount Refunded</TableHeadCell>
                  </TableHead>
                  <TableBody>
                    {currentData.map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <TableCell>
                          {`${sale.Customer.firstname} ${sale.Customer.lastname}`}
                        </TableCell>
                        <TableCell>{sale.Product.itemName}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>Rs. {sale.BuyItem.unitPrice}</TableCell>
                        <TableCell>
                          {new Date(sale.buyDateTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(sale.returnDateTime).toLocaleString()}
                        </TableCell>
                        <TableCell>{sale.reason}</TableCell>
                        <TableCell>
                          Rs. {sale.BuyItem.unitPrice * sale.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex overflow-x-auto sm:justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    showIcons
                  />
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-96">
                <p className="text-gray-400">You have no data yet!</p>
              </div>
            )}
          </div>

          <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
              <div className="relative w-full max-w-6xl mx-auto my-6">
                <div className="relative flex flex-col w-full bg-white border rounded-lg shadow-lg outline-none focus:outline-none">
                  <div className="flex items-center justify-between p-5 border-b border-solid rounded-t border-gray-300">
                    <h3 className="text-lg font-semibold">Add Return Item</h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <span
                        className="text-black h-6 w-6 text-2xl block outline-none focus:outline-none"
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedBillId("");
                          setShow7DayAlert(false);
                          setReturnAlert(false);
                          setShowError(false);
                        }}
                      >
                        ×
                      </span>
                    </button>
                  </div>
                  {/* Alert Component */}
                  {show7DayAlert && (
                    <Alert
                      className="mb-3"
                      color="failure"
                      icon={HiInformationCircle}
                    >
                      <span className="font-medium">Info alert!</span> You can't
                      return this item as the return period has exceeded 7
                      days.
                    </Alert>
                  )}
                  {/*Success Alert*/}
                  {returnAlert && (
                    <Alert
                      className="mb-3"
                      color="success"
                      icon={HiInformationCircle}
                    >
                      <span className="font-medium">Success alert!</span> Item
                      returned successfully.
                    </Alert>
                  )}

                  {/*Error Alert*/}
                  {showError && (
                    <Alert
                      className="mb-3"
                      color="failure"
                      icon={HiInformationCircle}
                    >
                      <span className="font-medium">Error alert!</span> Error
                      adding return items.
                    </Alert>
                  )}
                  {/* Modal Content */}
                  <div className="p-6 flex-auto">
                    <Label
                      htmlFor="billIdDropdown"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Select Bill Invoice Number
                    </Label>
                    <Select
                      id="billIdDropdown"
                      options={billIds
                        .filter(
                          (billId) =>
                            !billDetailsMap[billId].some(
                              (item) => item.quantity < 0
                            )
                        )
                        .map((billId) => ({
                          value: billId,
                          label: billId,
                        }))}
                      value={selectedBillId}
                      onChange={handleBillSelection}
                      isClearable
                      isSearchable
                      placeholder="Search and select a Bill ID"
                    />

                    {selectedBillId && billDetailsMap[selectedBillId.value] && (
                      <div className="mt-4 flex">
                        {/* Bill Details Section */}
                        <div className="w-1/2 pr-4">
                          <h3 className="text-lg font-semibold mb-2">
                            Bill Details
                          </h3>
                          <div className="relative flex flex-col w-full bg-white border rounded-lg shadow-lg outline-none focus:outline-none">
                            <div className="relative p-6 flex-auto">
                              <div className="mb-8">
                                <div className="flex items-center">
                                  <h2 className="text-lg font-bold mb-2">
                                    Bill To:
                                  </h2>
                                  <div className="text-gray-700 mb-2 ml-2">
                                    {
                                      billDetailsMap[selectedBillId.value][0]
                                        .Customer.firstname
                                    }{" "}
                                    {
                                      billDetailsMap[selectedBillId.value][0]
                                        .Customer.lastname
                                    }
                                  </div>
                                  <>
                                    <h2 className="text-lg font-bold mb-2 ml-auto">
                                      Date:
                                    </h2>
                                    <div className="text-gray-700 mb-2 ml-2">
                                      {new Intl.DateTimeFormat("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }).format(
                                        new Date(
                                          billDetailsMap[
                                            selectedBillId.value
                                          ][0].buyDateTime
                                        )
                                      )}
                                    </div>
                                  </>
                                </div>
                                <hr className="mb-2" />
                              </div>
                              <table className="w-full mb-8">
                                <thead>
                                  <tr>
                                    <th className="text-left font-bold text-gray-700">
                                      Description
                                    </th>
                                    <th className="text-right font-bold text-gray-700">
                                      Quantity
                                    </th>
                                    <th className="text-right font-bold text-gray-700">
                                      Unit Price
                                    </th>
                                    <th className="text-right font-bold text-gray-700">
                                      Total Price
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {billDetailsMap[selectedBillId.value].map(
                                    (item) => (
                                      <tr key={item.id}>
                                        <td className="text-left">
                                          {item.Product.itemName}
                                        </td>
                                        <td className="text-right">
                                          {item.quantity}
                                        </td>
                                        <td className="text-right">
                                          {item.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="text-right">
                                          {item.unitPrice *
                                            item.quantity.toFixed(2)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td className="text-left font-bold text-gray-700">
                                      Total
                                    </td>
                                    <td className="text-right font-bold text-gray-700"></td>
                                    <td className="text-right font-bold text-gray-700"></td>
                                    <td className="text-right font-bold text-gray-700">
                                      Rs.
                                      {billDetailsMap[selectedBillId.value]
                                        .reduce(
                                          (total, item) =>
                                            total +
                                            item.unitPrice * item.quantity,
                                          0
                                        )
                                        .toFixed(2)}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </div>
                        {/* Return Items Section */}
                        <div className="w-1/2 pl-4">
                          {selectedReturnItems.map((selectedItem, index) => (
                            <div key={index} className="mb-4 flex">
                              <div className="w-1/2 pr-2">
                                <Label
                                  htmlFor={`returnItemDropdown-${index}`}
                                  className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                  Select Return Item
                                </Label>
                                <Select
                                  id={`returnItemDropdown-${index}`}
                                  options={[
                                    ...new Set(
                                      billDetailsMap[selectedBillId.value]
                                        .filter(
                                          (item) =>
                                            !selectedReturnItems.includes(
                                              item.id
                                            )
                                        )
                                        .map((item) => item.Product.itemName)
                                    ),
                                  ].map((itemName) => {
                                    const item = billDetailsMap[
                                      selectedBillId.value
                                    ].find(
                                      (detail) =>
                                        detail.Product.itemName === itemName
                                    );
                                    return {
                                      value: item.id,
                                      label: itemName,
                                    };
                                  })}
                                  value={
                                    selectedItem
                                      ? {
                                          value: selectedItem,
                                          label: billDetailsMap[
                                            selectedBillId.value
                                          ].find(
                                            (item) => item.id === selectedItem
                                          )?.Product.itemName,
                                        }
                                      : null
                                  }
                                  onChange={(option) =>
                                    handleReturnItemSelection(option, index)
                                  }
                                  isClearable
                                  isSearchable
                                />
                              </div>

                              <div className="w-2/3 pl-2">
                                <Label
                                  htmlFor={`returnReasonInput-${index}`}
                                  className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                  Reason
                                </Label>
                                <TextInput
                                  id={`returnReasonInput-${index}`}
                                  type="text"
                                  value={returnReasons[index] || ""}
                                  onChange={(e) =>
                                    handleReturnReasonChange(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  placeholder="Enter reason"
                                  className="w-full h-10"
                                />
                              </div>
                              <div className="w-1/3 pl-2">
                                <Label
                                  htmlFor={`returnCountInput-${index}`}
                                  className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                  Count
                                </Label>
                                <TextInput
                                  id={`returnCountInput-${index}`}
                                  type="number"
                                  min="1"
                                  max={
                                    billDetailsMap[selectedBillId.value][index]
                                      .quantity
                                  }
                                  onChange={(e) =>
                                    handleReturnCountChange(e.target.value)
                                  }
                                  className="w-full h-10"
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            color="blue"
                            onClick={addAnotherReturnItem}
                            className="mr-2 mt-2"
                            disabled={
                              selectedReturnItems.length >=
                              [
                                ...new Set(
                                  billDetailsMap[selectedBillId.value].map(
                                    (item) => item.Product.itemName
                                  )
                                ),
                              ].length
                            }
                          >
                            Add Item for Return
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
                    {!isSubmitted ? (
                      <Button
                        className="h-10 w-36 ml-2 bg-red-500 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-700"
                        onClick={handleAddReturn}
                        disabled={
                          selectedReturnItems.length === 0 ||
                          Object.values(returnCounts).some(
                            (count) => count === 0
                          ) ||
                          show7DayAlert === true
                        }
                      >
                        Submit Return
                      </Button>
                    ) : (
                      <Button
                        className="h-10 w-36 ml-2 bg-red-500 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-700"
                        onClick={() => {
                          // Handle close functionality here
                          setIsModalOpen(false);
                          setSelectedBillId("");
                          setShow7DayAlert(false);
                          setReturnAlert(false);
                          setShowError(false);
                          setIsSubmitted(false);
                        }}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
