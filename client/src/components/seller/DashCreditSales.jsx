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
} from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { CiViewList } from "react-icons/ci";
import { FiPrinter } from "react-icons/fi";
import { HiHome } from "react-icons/hi";
import { PiExportBold } from "react-icons/pi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MdPayment } from "react-icons/md";

export default function DashCreditSales() {
  const theme = useSelector((state) => state.theme.theme);
  const { currentUser } = useSelector((state) => state.user);
  const [sales, setSales] = useState([]);
  const [salesDate, setSalesDate] = useState(null);
  const [createLoding, setCreateLoding] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagiation
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const onPageChange = (page) => setCurrentPage(page);

  const currentData = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        //setFilteredSales(groupedSales);
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
      if (sale.type == "Credit") {
        if (!groupedSales[sale.customerId]) {
          groupedSales[sale.customerId] = [sale];
        } else {
          groupedSales[sale.customerId].push(sale);
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
        //setFilteredSales(groupedSales);
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
                        {/* <TableHeadCell>Item IDs</TableHeadCell> */}
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
                            {/* <TableCell>
                              {bill.map((sale) => (
                                <span key={sale.id}>{sale.itemId}, </span>
                              ))}
                            </TableCell> */}
                            <TableCell>
                              Rs. {calculateTotalAmount(bill)}
                            </TableCell>
                            <TableCell>Rs.{bill[0].dueAmount}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setIsModalOpen(true);
                                }}
                                sx={{
                                  backgroundColor: "#f44336",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "#d32f2f",
                                  },
                                }}
                              >
                                <MdPayment className="mr-3 h-4 w-4" />
                                Pay Credits
                              </Button>
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
    </div>
  );
}
