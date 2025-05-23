import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Spinner,
  Alert,
} from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MdPayment } from "react-icons/md";
import { HiInformationCircle } from "react-icons/hi";
import {
  FaSearch,
  FaCreditCard,
  FaMoneyBillWave,
  FaDollarSign,
} from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";

export default function DashCreditSales() {
  const theme = useSelector((state) => state.theme.theme);
  const { currentUser } = useSelector((state) => state.user);
  const [sales, setSales] = useState([]);
  const [salesDate, setSalesDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createLoding, setCreateLoding] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredSales, setFilteredSales] = useState([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [showError, setShowError] = useState(false);
  const [showErrorDueAmountUpdate, setShowErrorDueAmountUpdate] =
    useState(false);

  const isFilterActive =
    searchQuery !== "" || salesDate !== null || salesDate !== "";

  const handlePayment = async () => {
    if (
      parseFloat(paidAmount) > selectedBill[0].dueAmount ||
      paidAmount === "" ||
      paidAmount === "0" ||
      paidAmount < 0
    ) {
      setShowError(true);
      //alert("Please Enter Valid Amount.");
      return;
    }

    try {
      setCreateLoding(true);

      // Assuming selectedBill
      const res = await fetch(
        `/api/sales-report/updateDueAmount/${selectedBill[0].id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedBill[0].id,
            dueAmount: selectedBill[0].dueAmount - parseFloat(paidAmount),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setShowError(false);
        // Update the sales state
        const updatedSales = sales.map((bill) => {
          if (bill === selectedBill) {
            return bill.map((sale) => ({
              ...sale,
              dueAmount: sale.dueAmount - parseFloat(paidAmount),
            }));
          }
          return bill;
        });

        setSales(updatedSales);
        setFilteredSales(updatedSales);
      } else {
        setShowErrorDueAmountUpdate(true);
        //alert("Failed to update due amount.");
      }

      setIsModalOpen(false);
      setPaidAmount("");
    } catch (error) {
      console.log(error.message);
    } finally {
      setCreateLoding(false);
    }
  };

  // Pagiation
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const onPageChange = (page) => setCurrentPage(page);

  const currentData = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to handle search by query
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle search by date
  const handleDateChange = (e) => {
    setSalesDate(e.target.value);
  };

  // Function to filter sales based on search query and date change
  const filterSales = () => {
    const filtered = sales.filter((bill) => {
      const customerName = bill[0].Customer
        ? `${bill[0].Customer.firstname} ${bill[0].Customer.lastname}`
        : "Unknown";
      const shopName = bill[0].Shop ? bill[0].Shop.shopName : "Unknown";
      const buyDate = new Date(bill[0].buyDateTime).toLocaleDateString();
      const buyTime = new Date(bill[0].buyDateTime).toLocaleTimeString();
      const totalAmount = calculateTotalAmount(bill);
      const billId = generateBillId(bill);
      const searchValues = `${customerName} ${shopName} ${buyDate} ${buyTime} ${totalAmount} ${billId}`;

      const matchesQuery = searchValues
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDate = salesDate
        ? new Date(bill[0].buyDateTime).toISOString().split("T")[0] ===
          salesDate
        : true;

      return matchesQuery && matchesDate;
    });

    setFilteredSales(filtered);
  };

  //fetch sales
  const fetchSales = async () => {
    try {
      setCreateLoding(true);
      const res = await fetch("api/sales-report/getsales");
      const data = await res.json();
      if (res.ok) {
        // Group sales by customerId, shopId, and buyDateTime
        const groupedSales = groupSales(data.sales);
        setSales(groupedSales);
        setFilteredSales(groupedSales);
        setCreateLoding(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Function to group sales by customerId, shopId, and buyDateTime
  const groupSales = (sales) => {
    const groupedSales = {};
    sales.forEach((sale) => {
      if (sale.type === "Credit") {
        const key = `${sale.customerId}-${sale.shopId}-${sale.buyDateTime}`;
        if (!groupedSales[key]) {
          groupedSales[key] = [sale];
        } else {
          groupedSales[key].push(sale);
        }
      }
    });
    return Object.values(groupedSales);
  };

  // Function to calculate total amount for a bill
  const calculateTotalAmount = (bill) => {
    return bill.reduce(
      (total, sale) => total + sale.quantity * sale.unitPrice,
      0
    );
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

  const fetchSalesByShopId = async (shopId) => {
    try {
      setCreateLoding(true);
      const res = await fetch(`api/sales-report/getsales/${shopId}`);
      const data = await res.json();
      if (res.ok) {
        // Group sales by customerId, shopId, and buyDateTime
        const groupedSales = groupSales(data.sales);
        setSales(groupedSales);
        setFilteredSales(groupedSales);
        setCreateLoding(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (
      currentUser.role === "Accountant" ||
      currentUser.role === "Admin" ||
      currentUser.role === "Director"
    ) {
      fetchSales();
    } else if (currentUser.role === "Seller") {
      //get user's shopId from shop table
      const fetchShopId = async () => {
        try {
          const res = await fetch(`api/shop/getshop/${currentUser.id}`);
          const data = await res.json();
          if (res.ok) {
            fetchSalesByShopId(data.shops[0].id);
          }
        } catch (error) {
          console.log(error.message);
        }
      };
      fetchShopId();
    }
  }, []);

  useEffect(() => {
    if (isFilterActive) {
      filterSales();
    } else {
      setFilteredSales(sales); // Reset to all sales when no filters are active
    }
  }, [searchQuery, salesDate]);

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
            <Breadcrumb.Item>Credit Sales</Breadcrumb.Item>
          </Breadcrumb>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Credit Sales</h2>
            <div className="flex items-center space-x-2">
              <Label>Filter by Date</Label>
              <TextInput
                id="date"
                type="date"
                placeholder="Date"
                onChange={handleDateChange}
                className="w-full md:w-48 h-10 mb-2 md:mb-0 md:mr-2"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
              <TextInput
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search"
                className="w-full md:w-52 h-10"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center">
              {/* Total Amount of credit sales display */}
              <div className="flex items-center mb-2 md:mb-0 md:mr-2">
                <FaCreditCard className="mr-2 text-blue-500" />
                <Label className="mr-2">Total Credit Sales:</Label>
                <span className="text-blue-500">
                  Rs.{" "}
                  {sales.reduce(
                    (total, bill) => total + calculateTotalAmount(bill),
                    0
                  )}
                </span>
              </div>
              {/* Total Due Amount display */}
              <div className="flex items-center mb-2 md:mb-0 md:mr-2">
                <FaDollarSign className="mr-2 text-red-500" />
                <Label className="mr-2">Total Due Amount:</Label>
                <span className="text-red-500">
                  Rs.{" "}
                  {sales.reduce((total, bill) => total + bill[0].dueAmount, 0)}
                </span>
              </div>
              {/* Total Paid Amount display */}
              <div className="flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-500" />
                <Label className="mr-2">Total Paid Amount:</Label>
                <span className="text-green-500">
                  Rs.{" "}
                  {sales.reduce(
                    (total, bill) =>
                      total + calculateTotalAmount(bill) - bill[0].dueAmount,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {createLoding ? (
              <div className="flex justify-center items-center h-96">
                <Spinner size="xl" />
              </div>
            ) : (
              <>
                {currentData.length > 0 ? (
                  <>
                    <Table hoverable className="shadow-md w-full">
                      <TableHead>
                        <TableHeadCell>Invoice</TableHeadCell>
                        <TableHeadCell>Customer Name</TableHeadCell>
                        <TableHeadCell>Shop Name</TableHeadCell>
                        <TableHeadCell>Buy Date</TableHeadCell>
                        <TableHeadCell>Buy Time</TableHeadCell>
                        <TableHeadCell>Total Amount</TableHeadCell>
                        <TableHeadCell>Due Amount</TableHeadCell>
                        <TableHeadCell></TableHeadCell>
                      </TableHead>
                      <TableBody>
                        {currentData.map((bill, index) => (
                          <TableRow
                            key={index}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <TableCell>{generateBillId(bill)}</TableCell>
                            <TableCell>
                              {bill[0].Customer
                                ? bill[0].Customer.firstname +
                                  " " +
                                  bill[0].Customer.lastname
                                : "Unknown"}
                            </TableCell>
                            {bill[0].Shop ? (
                              <TableCell>{bill[0].Shop.shopName}</TableCell>
                            ) : (
                              <TableCell>Unknown</TableCell>
                            )}
                            <TableCell>
                              {new Date(
                                bill[0].buyDateTime
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                bill[0].buyDateTime
                              ).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              Rs. {calculateTotalAmount(bill)}
                            </TableCell>
                            <TableCell>Rs.{bill[0].dueAmount}</TableCell>
                            <TableCell>
                              {bill[0].dueAmount === 0 ? (
                                <div className="flex items-center text-green-500">
                                  <MdCheckCircle className="mr-2 h-5 w-5" />
                                  Paid
                                </div>
                              ) : (
                                <button
                                  style={{
                                    pointerEvents:
                                      currentUser.role === "Accountant" ||
                                      currentUser.role === "Director" ||
                                      currentUser.role === "Admin"
                                        ? "none"
                                        : "auto",
                                  }}
                                  className="flex items-center text-red-500 bg-transparent border-none cursor-pointer p-0 focus:outline-none"
                                  onClick={() => {
                                    setSelectedBill(bill);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <MdPayment className="mr-2 h-5 w-5" />
                                  Pay Credits
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

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
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <Modal
        show={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowError(false);
          setShowErrorDueAmountUpdate(false);
        }}
      >
        <Modal.Header>Pay Credits</Modal.Header>
        {showError && (
          <Alert className="mb-3" color="failure" icon={HiInformationCircle}>
            <span className="font-medium">Error alert!</span>
            Please Enter Valid Amount.
          </Alert>
        )}

        {showErrorDueAmountUpdate && (
          <Alert className="mb-3" color="failure" icon={HiInformationCircle}>
            <span className="font-medium">Error alert!</span>
            Failed to update due amount.
          </Alert>
        )}

        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              id="paidAmount"
              type="number"
              placeholder="Enter amount to pay"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePayment}>Submit Payment</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
