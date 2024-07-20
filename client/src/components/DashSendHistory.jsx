import { React, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Avatar,
  Button,
  Breadcrumb,
  Modal,
  Checkbox,
  Label,
  Alert,
  TextInput,
  Select,
  Spinner,
  Pagination,
  Badge,
  Tabs,
} from "flowbite-react";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Profile from "../assets/add-pic.png";
import {
  HiOutlineExclamationCircle,
  HiPlusCircle,
  HiUserAdd,
  HiCheckCircle,
} from "react-icons/hi";
import { HiBuildingStorefront } from "react-icons/hi2";

import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { CiViewList } from "react-icons/ci";
import { FiPrinter } from "react-icons/fi";
import { PiExportBold } from "react-icons/pi";

import { motion, AnimatePresence } from "framer-motion";

export default function DashSendHistory() {
  const { currentUser } = useSelector((state) => state.user);
  const [historyData, setHistoryData] = useState([]);
  const [historyDataStore, setHistoryDataStore] = useState([]);

  const [skeeperMstores, setstoreStoreKeeper] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [storeIdToDelete, setStoreIdToDelete] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalAssignStoreKeeper, setOpenModalAssignStoreKeeper] =
    useState(false);

  const [formData, setFormData] = useState({});

  const [createUserError, setCreateUserError] = useState(null);
  const [createLoding, setCreateLoding] = useState(null);

  const [storeKeeper, setStoreKeeper] = useState([]);

  // Pagiation
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(historyData.length / itemsPerPage);

  const onPageChange = (page) => setCurrentPage(page);

  const currentData = historyData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Pagination

  // Pagiation
  const [currentPageStore, setCurrentPageStore] = useState(1);
  const itemsPerPageStore = 6;
  const totalPagesStore = Math.ceil(
    historyDataStore.length / itemsPerPageStore
  );

  const onPageChangeStore = (page) => setCurrentPageStore(page);

  const currentDataStore = historyDataStore.slice(
    (currentPageStore - 1) * itemsPerPageStore,
    currentPageStore * itemsPerPageStore
  );
  // Pagination

  const fetchAllItemSendHistoryShop = async () => {
    try {
      setCreateLoding(true);
      const response = await fetch(
        "/api/itemsendhistory/getallitemsendhistoryshop",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      const responseData = await response.json();
      if (responseData.success) {
        setHistoryData(responseData.data);
        setCreateLoding(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllItemSendHistoryStore = async () => {
    try {
      setCreateLoding(true);
      const response = await fetch(
        "/api/itemsendhistory/getallitemsendhistorystore",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      const responseData = await response.json();
      if (responseData.success) {
        setHistoryDataStore(responseData.data);
        setCreateLoding(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllItemSendHistoryShop();
    fetchAllItemSendHistoryStore();
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
            <Breadcrumb.Item>Items Send History</Breadcrumb.Item>
          </Breadcrumb>

          <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
            Items Send History
          </h1>

          <Tabs aria-label="Tabs with underline" variant="underline">
            <Tabs.Item active title="Shop to Shop" icon={HiBuildingStorefront}>
              This is{" "}
              <span className="font-medium text-gray-800 dark:text-white">
                Shop to Shop
              </span>{" "}
              Items Send History
              <div className="mb-4"></div>
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
                          <TableHeadCell>Sender</TableHeadCell>
                          <TableHeadCell>Receiver</TableHeadCell>
                          <TableHeadCell>Item Name</TableHeadCell>
                          <TableHeadCell>Unit Price</TableHeadCell>
                          <TableHeadCell>Send Date</TableHeadCell>
                          <TableHeadCell>Quantity</TableHeadCell>
                          <TableHeadCell>Status</TableHeadCell>
                        </TableHead>
                        {currentData.map((history) => (
                          <Table.Body className="divide-y" key={history.id}>
                            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                              <TableCell>{history.Sender.shopName}</TableCell>
                              <TableCell>{history.Receiver.shopName}</TableCell>
                              <TableCell>{history.Item.itemName}</TableCell>
                              <TableCell>
                                Rs. {history.Item.itemPrice}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  history.createdAt
                                ).toLocaleDateString()}{" "}
                                <br />
                                {new Date(
                                  history.createdAt
                                ).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    color="gray"
                                    size="sm"
                                    Label="In Stock"
                                  >
                                    {history.quantity} Qty
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className="pl-3 pr-3 w-20"
                                  color={
                                    history.status === "approved"
                                      ? "green"
                                      : history.status === "pending"
                                      ? "yellow"
                                      : history.status === "rejected"
                                      ? "red"
                                      : history.status === "in_review"
                                      ? "blue"
                                      : "grey" // Default color if none of the conditions match
                                  }
                                  icon={
                                    history.status === "approved"
                                      ? HiCheckCircle
                                      : history.status === "pending"
                                      ? MdOutlineAccessTimeFilled
                                      : history.status === "rejected"
                                      ? MdCancel
                                      : history.status === "in_review"
                                      ? MdOutlineAccessTimeFilled
                                      : MdOutlineAccessTimeFilled // Default color if none of the conditions match
                                  }
                                >
                                  <p className=" capitalize">
                                    {history.status}
                                  </p>
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </Table.Body>
                        ))}
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
                </>
              )}
            </Tabs.Item>

            <Tabs.Item active title="Store to Shop" icon={HiBuildingStorefront}>
              This is{" "}
              <span className="font-medium text-gray-800 dark:text-white">
                Store to Shop
              </span>{" "}
              Items Send History
              <div className="mb-4"></div>
              {createLoding ? (
                <div className="flex justify-center items-center h-96">
                  <Spinner size="xl" />
                </div>
              ) : (
                <>
                  {currentDataStore.length > 0 ? (
                    <>
                      <Table hoverable className="shadow-md w-full">
                        <TableHead>
                          <TableHeadCell>Sender</TableHeadCell>
                          <TableHeadCell>Receiver</TableHeadCell>
                          <TableHeadCell>Item Name</TableHeadCell>
                          <TableHeadCell>Unit Price</TableHeadCell>
                          <TableHeadCell>Send Date</TableHeadCell>
                          <TableHeadCell>Quantity</TableHeadCell>
                          <TableHeadCell>Status</TableHeadCell>
                        </TableHead>
                        {currentDataStore.map((history) => (
                          <Table.Body className="divide-y" key={history.id}>
                            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                              <TableCell>
                                {history.SenderShop.storeName}
                              </TableCell>
                              <TableCell>{history.Receiver.shopName}</TableCell>
                              <TableCell>{history.Item.itemName}</TableCell>
                              <TableCell>
                                Rs. {history.Item.itemPrice}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  history.createdAt
                                ).toLocaleDateString()}{" "}
                                <br />
                                {new Date(
                                  history.createdAt
                                ).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    color="gray"
                                    size="sm"
                                    Label="In Stock"
                                  >
                                    {history.quantity} Qty
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className="pl-3 pr-3 w-20"
                                  color={
                                    history.status === "approved"
                                      ? "green"
                                      : history.status === "pending"
                                      ? "yellow"
                                      : history.status === "rejected"
                                      ? "red"
                                      : history.status === "in_review"
                                      ? "blue"
                                      : "grey" // Default color if none of the conditions match
                                  }
                                  icon={
                                    history.status === "approved"
                                      ? HiCheckCircle
                                      : history.status === "pending"
                                      ? MdOutlineAccessTimeFilled
                                      : history.status === "rejected"
                                      ? MdCancel
                                      : history.status === "in_review"
                                      ? MdOutlineAccessTimeFilled
                                      : MdOutlineAccessTimeFilled // Default color if none of the conditions match
                                  }
                                >
                                  <p className=" capitalize">
                                    {history.status}
                                  </p>
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </Table.Body>
                        ))}
                      </Table>

                      <div className="flex overflow-x-auto sm:justify-center">
                        <Pagination
                          currentPage={currentPageStore}
                          totalPages={totalPagesStore}
                          onPageChange={onPageChangeStore}
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
            </Tabs.Item>
          </Tabs>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
