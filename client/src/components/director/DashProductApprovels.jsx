import { React, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Toast,
  Badge,
} from "flowbite-react";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  HiOutlineExclamationCircle,
  HiPlusCircle,
  HiUserAdd,
  HiOutlineArrowCircleRight,
  HiInformationCircle,
  HiOutlineCheckCircle,
  HiXCircle,
  HiCurrencyDollar,
  HiCheck,
  HiPaperAirplane,
  HiCheckCircle,
} from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { CiViewList } from "react-icons/ci";
import { FiPrinter } from "react-icons/fi";
import { PiExportBold } from "react-icons/pi";

import { MdAdd, MdRemove } from "react-icons/md";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { FaFileCircleCheck } from "react-icons/fa6";
import { GoChecklist } from "react-icons/go";
import Logolight from "../../assets/logolight.png";
import { RiFileCloseLine } from "react-icons/ri";

export default function DashProductApprovels() {
  const { currentUser } = useSelector((state) => state.user);

  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [shops, setShops] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [sendItemId, setSendItemId] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useSelector((state) => state.theme.theme);

  const [createUserError, setCreateUserError] = useState(null);
  const [createLoding, setCreateLoding] = useState(false);
  const [seller, setSeller] = useState([]);
  const [formData, setFormData] = useState({});

  const [shopId, setShopId] = useState([]);

  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Function to handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) =>
    product.sendItem.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      setCreateLoding(true);
      const res = await fetch(`/api/shop-item/getallshopitems`);
      const data = await res.json();
      if (res.ok) {
        setAllProducts(data.shopItems);
      }
      setCreateLoding(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleChange(e);
    setCreateLoding(true);
    console.log(sendItemId, formData.shopId, selectedProduct.id);
    try {
      const res = await fetch(
        `/api/shop-item/senditem/${sendItemId}/${formData.shopId}/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setCreateLoding(false);
        setOpenModal(false);
        setCreateUserError(null);

        // Update local state with updated stock data
        const updatedProducts = allProducts.map((product) => {
          if (product.id === sendItemId) {
            return {
              ...product,
              quantity: product.quantity - formData.quantity,
            };
          }
          return product;
        });
        setAllProducts(updatedProducts);

        Toast.success("Stock sent successfully!");
      } else {
        setCreateUserError(data.message);
        setCreateLoding(false);
      }
    } catch (error) {
      console.log(error.message);
      setCreateLoding(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let updatedQuantity = value;

    if (id === "quantity" && selectedProduct) {
      const maxAvailableQuantity = selectedProduct.quantity;
      updatedQuantity = Math.min(parseInt(value), maxAvailableQuantity);
    }
    setFormData({ ...formData, [id]: updatedQuantity });
    console.log(formData);
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/shop-item/approveitem/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        selectedTransfer.status = "approved";
        setShowModal(false);
        fetchShopItems();
        Toast.success("Product approved successfully!");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handelReject = async (fromId, itemId, shopId, quantity) => {
    console.log(fromId, itemId, shopId, quantity);

    console.log(
      "shopId:" +
        shopId +
        " itemId:" +
        itemId +
        " fromId:" +
        fromId +
        " quantity:" +
        quantity
    );

    try {
      const res = await fetch(
        `/api/shop-item/rejectitem/${shopId}/${itemId}/${fromId}/${quantity}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        selectedTransfer.status = "rejected";
        setShowModal1(false);
        fetchShopItems();
        Toast.success("Product rejected successfully!");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

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
            <Breadcrumb.Item>Approvels</Breadcrumb.Item>
          </Breadcrumb>

          <div className="mt-4 min-h-screen flex flex-col md:flex-row">
            <div className="md:w-full mr-5">
              <div className="flex items-center justify-between">
                <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
                  Approvels - Shop To Shop
                </h1>
                <div className="flex items-center">
                  <TextInput
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search products"
                    className="w-72 h-10"
                  />
                </div>
              </div>

              <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                  <div className="relative w-full max-w-lg mx-auto my-6">
                    <div className="relative flex flex-col w-full bg-white border rounded-lg shadow-lg outline-none focus:outline-none">
                      <div className="flex items-center justify-between p-5 border-b border-solid rounded-t border-gray-300">
                        <h3 className="text-2xl font-semibold">
                          {theme === "light" ? (
                            <img
                              src={Logolight}
                              className="h-10"
                              alt="Flowbite Logo"
                            />
                          ) : (
                            <img
                              src={Logolight}
                              className="h-10"
                              alt="Flowbite Logo"
                            />
                          )}
                        </h3>
                        <div className="ml-4 text-right">
                          <h1 className="text-xl font-bold">
                            Product Transfer Invoice
                          </h1>
                          <div>
                            Date :{" "}
                            {selectedTransfer
                              ? new Date(
                                  selectedTransfer.updatedAt
                                ).toLocaleDateString()
                              : ""}
                          </div>
                          <div>
                            Time :{" "}
                            {selectedTransfer
                              ? new Date(
                                  selectedTransfer.updatedAt
                                ).toLocaleTimeString()
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="relative p-5 flex-auto">
                        <div className="flex ">
                          <h2 className="text-lg font-bold mb-4">Status:</h2>
                          <b>
                            {selectedTransfer ? (
                              <Badge
                                className="pl-3 pr-3 w-20 ml-3"
                                color={
                                  selectedTransfer.status === "approved"
                                    ? "green"
                                    : selectedTransfer.status === "pending"
                                    ? "yellow"
                                    : selectedTransfer.status === "rejected"
                                    ? "red"
                                    : selectedTransfer.status === "in_review"
                                    ? "blue"
                                    : "grey" // Default color if none of the conditions match
                                }
                                icon={
                                  selectedTransfer.status === "approved"
                                    ? HiCheckCircle
                                    : selectedTransfer.status === "pending"
                                    ? MdOutlineAccessTimeFilled
                                    : selectedTransfer.status === "rejected"
                                    ? MdCancel
                                    : selectedTransfer.status === "in_review"
                                    ? MdOutlineAccessTimeFilled
                                    : MdOutlineAccessTimeFilled // Default color if none of the conditions match
                                }
                              >
                                <p className=" capitalize">
                                  {selectedTransfer.status}
                                </p>
                              </Badge>
                            ) : (
                              ""
                            )}
                          </b>
                        </div>

                        <div className="flex">
                          <div className="mb-8">
                            <h2 className="text-lg font-bold mb-4">
                              Send Shop:
                            </h2>
                            <div className="text-gray-700 mb-2">
                              <b>Shop Name:</b>{" "}
                              {selectedTransfer
                                ? selectedTransfer.fromshop.shopName
                                : ""}
                            </div>
                            <div className="text-gray-700 mb-2">
                              <b>Seller Name:</b>{" "}
                              {selectedTransfer ? (
                                <>
                                  {selectedTransfer.fromshop.seller.firstname}{" "}
                                  {selectedTransfer.fromshop.seller.lastname}{" "}
                                </>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="text-gray-700 mb-2">
                              <b>Phone:</b>{" "}
                              {selectedTransfer
                                ? selectedTransfer.fromshop.phone
                                : ""}
                            </div>
                            <div className="text-gray-700">
                              <b>Address:</b>{" "}
                              {selectedTransfer
                                ? selectedTransfer.fromshop.address
                                : ""}
                            </div>
                          </div>

                          <div className="mb-8 ml-8">
                            {" "}
                            {/* Added ml-8 for margin left */}
                            <h2 className="text-lg font-bold mb-4">
                              Received Shop:
                            </h2>
                            <div className="text-gray-700 mb-2">
                              <b>Shop Name:</b>{" "}
                              {selectedTransfer
                                ? selectedTransfer.shop.shopName
                                : ""}
                            </div>
                            <div className="text-gray-700 mb-2">
                              <b>Seller Name:</b>{" "}
                              {selectedTransfer ? (
                                <>
                                  {selectedTransfer.shop.seller.firstname}{" "}
                                  {selectedTransfer.shop.seller.lastname}{" "}
                                </>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="text-gray-700 mb-2">
                              <b>Phone:</b>{" "}
                              {selectedTransfer
                                ? selectedTransfer.shop.phone
                                : ""}
                            </div>
                            <div className="text-gray-700">
                              <b>Address:</b>{" "}
                              {selectedTransfer
                                ? selectedTransfer.shop.address
                                : ""}
                            </div>
                          </div>
                        </div>

                        <hr className="mb-2" />
                        <br></br>
                        <table className="w-full mb-8">
                          <thead>
                            <tr>
                              <th className="text-left font-bold text-gray-700">
                                Item Name
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
                            <tr>
                              <td className="text-left text-gray-700">
                                {selectedTransfer
                                  ? selectedTransfer.sendItem.itemName
                                  : ""}
                              </td>
                              <td className="text-right text-gray-700 items-end">
                                {selectedTransfer
                                  ? selectedTransfer.lastreceivedquantity
                                  : ""}{" "}
                              </td>

                              <td className="text-right text-gray-700">
                                Rs.{" "}
                                {selectedTransfer
                                  ? selectedTransfer.sendItem.itemPrice
                                  : ""}
                              </td>
                              <td className="text-right text-gray-700">
                                <b>
                                  Rs.{" "}
                                  {selectedTransfer
                                    ? (
                                        selectedTransfer.sendItem.itemPrice *
                                        selectedTransfer.lastreceivedquantity
                                      ).toFixed(2)
                                    : ""}
                                </b>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="flex items-center justify-between p-6 border-t border-solid rounded-tl-lg rounded-tr-lg rounded-b border-gray-300">
                          <Button.Group>
                            <Button
                              onClick={() => setIsModalOpen(false)}
                              color="gray"
                              className="rounded-lg"
                            >
                              <IoMdClose className="mr-3 h-4 w-4" />
                              Close
                            </Button>
                          </Button.Group>

                          {selectedTransfer ? (
                            <>
                              {selectedTransfer.status != "approved" &&
                              selectedTransfer.status != "rejected" ? (
                                <Button.Group>
                                  <Button
                                    color="green"
                                    onClick={() => {
                                      setShowModal(true);
                                    }}
                                  >
                                    <GoChecklist className="mr-3 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    color="red"
                                    onClick={() => {
                                      setShowModal1(true);
                                    }}
                                  >
                                    <RiFileCloseLine className="mr-3 h-4 w-4" />
                                    Rejected
                                  </Button>
                                </Button.Group>
                              ) : (
                                ""
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>

              <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                popup
                size="md"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Modal.Header />
                  <Modal.Body>
                    <div className="text-center">
                      <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                      <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                        Are you sure you want to approve this product?
                      </h3>
                      <div className="flex justify-center gap-4">
                        <Button
                          color="failure"
                          onClick={() => {
                            handleApprove(selectedTransfer.id);
                          }}
                        >
                          Yes, I'm sure
                        </Button>
                        <Button
                          color="gray"
                          onClick={() => setShowModal(false)}
                        >
                          No, cancel
                        </Button>
                      </div>
                    </div>
                  </Modal.Body>
                </motion.div>
              </Modal>

              <Modal
                show={showModal1}
                onClose={() => setShowModal1(false)}
                popup
                size="md"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Modal.Header />
                  <Modal.Body>
                    <div className="text-center">
                      <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                      <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                        Are you sure you want to reject this product?
                        {
                          // selectedTransfer.fromshop.seller.firstname
                          selectedTransfer ? selectedTransfer.itemId : ""
                        }
                      </h3>
                      <div className="flex justify-center gap-4">
                        <Button
                          color="failure"
                          onClick={() => {
                            handelReject(
                              selectedTransfer.fromId,
                              selectedTransfer.itemId,
                              selectedTransfer.shop.id,
                              selectedTransfer.lastreceivedquantity
                            );
                          }}
                        >
                          Yes, I'm sure
                        </Button>
                        <Button
                          color="gray"
                          onClick={() => setShowModal1(false)}
                        >
                          No, cancel
                        </Button>
                      </div>
                    </div>
                  </Modal.Body>
                </motion.div>
              </Modal>

              {createLoding ? (
                <div className="flex justify-center items-center h-96">
                  <Spinner size="xl" />
                </div>
              ) : (
                <>
                  {filteredProducts.length > 0 ? (
                    <>
                      <Table hoverable className="mt-2 shadow-md w-full">
                        <TableHead>
                          <TableHeadCell>Product Name</TableHeadCell>
                          <TableHeadCell>Manufacturer</TableHeadCell>
                          <TableHeadCell>Price</TableHeadCell>
                          <TableHeadCell>Send Date</TableHeadCell>
                          <TableHeadCell>Send Shop</TableHeadCell>
                          <TableHeadCell>Received Shop</TableHeadCell>
                          <TableHeadCell>Quantity</TableHeadCell>
                          <TableHeadCell>Status</TableHeadCell>
                          <TableHeadCell></TableHeadCell>
                          <TableHeadCell>
                            <span className="sr-only">Edit</span>
                          </TableHeadCell>
                        </TableHead>
                        {filteredProducts.map((product) => (
                          <Table.Body className="divide-y" key={product.id}>
                            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                              <TableCell>
                                <b>{product.sendItem.itemName}</b>
                              </TableCell>
                              <TableCell>
                                {product.sendItem.manufacturer}
                              </TableCell>
                              <TableCell>
                                Rs. {product.sendItem.itemPrice}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  product.updatedAt
                                ).toLocaleDateString()}{" "}
                                <br />
                                {new Date(
                                  product.updatedAt
                                ).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>{product.fromshop.shopName}</TableCell>
                              <TableCell> {product.shop.shopName}</TableCell>

                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    color="gray"
                                    size="sm"
                                    Label="In Stock"
                                  >
                                    {product.lastreceivedquantity} Qty
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className="pl-3 pr-3 w-20"
                                  color={
                                    product.status === "approved"
                                      ? "green"
                                      : product.status === "pending"
                                      ? "yellow"
                                      : product.status === "rejected"
                                      ? "red"
                                      : product.status === "in_review"
                                      ? "blue"
                                      : "grey" // Default color if none of the conditions match
                                  }
                                  icon={
                                    product.status === "approved"
                                      ? HiCheckCircle
                                      : product.status === "pending"
                                      ? MdOutlineAccessTimeFilled
                                      : product.status === "rejected"
                                      ? MdCancel
                                      : product.status === "in_review"
                                      ? MdOutlineAccessTimeFilled
                                      : MdOutlineAccessTimeFilled // Default color if none of the conditions match
                                  }
                                >
                                  <p className=" capitalize">
                                    {product.status}
                                  </p>
                                </Badge>
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell>
                                {product.status === "approved" ? (
                                  <Button
                                    onClick={() => {
                                      setSelectedTransfer(product);
                                      setIsModalOpen(true);
                                    }}
                                    className="w-28"
                                    color="green"
                                  >
                                    <GoChecklist className="mr-3 h-4 w-4" />
                                    View
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setSelectedTransfer(product);
                                      setIsModalOpen(true);
                                    }}
                                    className="w-28"
                                    color="green"
                                  >
                                    <GoChecklist className="mr-3 h-4 w-4" />
                                    View
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          </Table.Body>
                        ))}
                      </Table>
                    </>
                  ) : (
                    <p>You have no store yet!</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
