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
import { MdAdd, MdRemove } from "react-icons/md";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { MdCancel } from "react-icons/md";

export default function DashSellerSendStock() {
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
  const [createUserError, setCreateUserError] = useState(null);
  const [createLoding, setCreateLoding] = useState(false);
  const [seller, setSeller] = useState([]);
  const [formData, setFormData] = useState({ shopId:"no" });
  const [error, setError] = useState("");

  const [shopId, setShopId] = useState([]); // [1

  // Function to handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) =>
    product.itemDetails.itemName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopIdRes = await fetch(`/api/shop/getshop/${currentUser.id}`);
        const shopIdData = await shopIdRes.json();
        if (shopIdRes.ok) {
          setShopId(shopIdData.shops[0]);
          const currentShopId = shopIdData.shops[0].id; // Store the current shop ID
          setShopId(currentShopId);
          const productsRes = await fetch(
            `/api/shop-item/getshopitems/${shopIdData.shops[0].id}`
          );
          const productsData = await productsRes.json();
          if (productsRes.ok) {
            setAllProducts(productsData.shopItems);
            if (productsData.shopItems.length < 9) {
              setShowMore(false);
            }
          }

          const shopsRes = await fetch(`/api/shop/getshops`);
          const shopsData = await shopsRes.json();
          if (shopsRes.ok) {
            setShops(shopsData.shops);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchData();
  }, [currentUser.id]);

  const handleSubmit = async (formData, selectedProduct) => {
    console.log(
      "ShopId:" +
        formData.shopId +
        " ItemId: " +
        selectedProduct.itemId +
        " FromId:" +
        selectedProduct.fromId +
        " Quantity: " +
        formData.quantity
    );

    setCreateLoding(true);
    try {
      const res = await fetch(
        `/api/shop-item/senditem/${selectedProduct.shopId}/${selectedProduct.itemId}/${selectedProduct.fromId}/${formData.shopId}/${formData.quantity}`,
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
        setFormData({});
        setAllProducts(
          allProducts.map((product) =>
            product.id === selectedProduct.id
              ? { ...product, quantity: product.quantity - formData.quantity }
              : product
          )
        );
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        setCreateLoding(false);
        setCreateUserError(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handelClear = () => {
    setFormData({ shopId: "no" });
    setOpenModal(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value <= 0) {
      setError("Quantity cannot be negative(-) or 0");
    } else if (value > selectedProduct.quantity) {
      setError(`Quantity should be less than ${selectedProduct.quantity}`);
    } else {
      setFormData({
        ...formData,
        quantity: value,
      });
      setError("");
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
            <Breadcrumb.Item>Send Stock</Breadcrumb.Item>
          </Breadcrumb>

          <div className="mt-4 min-h-screen flex flex-col md:flex-row">
            <div className="md:w-full mr-5">
              <div className="flex items-center justify-between">
                <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
                  Send Stock
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

              <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Modal.Header>Send Item Stock </Modal.Header>
                  <Modal.Body>
                    <div className="space-y-6">
                      <form className="flex flex-col flex-grow gap-4">
                        {error && <Alert color="failure">{error}</Alert>}

                        <div className="flex gap-5 mb-4">
                          <div className="w-full ">
                            {openModal ? (
                              <>
                                <div className="flex gap-2 w-full">
                                  <div className="w-full">
                                    <div className="mb-2 block">
                                      <h1 className="text-lg text-gray-500">
                                        <b>Item Details</b>
                                      </h1>
                                    </div>

                                    <div className="mb-2 block">
                                      <h1 className="text-md text-gray-700">
                                        <b>Name : </b>{" "}
                                        {selectedProduct.itemDetails.itemName}
                                      </h1>
                                    </div>

                                    <div className="mb-2 block">
                                      <h1 className="text-md text-gray-700">
                                        <b>Price : </b> Rs.{" "}
                                        {selectedProduct.itemDetails.itemPrice}
                                      </h1>
                                    </div>

                                    <div className=" block">
                                      <h1 className="text-md text-gray-700">
                                        <div className="flex gap-3 ">
                                          <p>
                                            <b>Quantity : </b>{" "}
                                          </p>
                                          <Badge
                                            className="pl-3 pr-3"
                                            color="green"
                                            icon={HiCheckCircle}
                                          >
                                            {selectedProduct.quantity} in stock
                                          </Badge>
                                        </div>
                                      </h1>
                                    </div>
                                  </div>

                                  <div className="w-full">
                                    <div className="mb-2 block">
                                      <h1 className="text-lg text-gray-500">
                                        <b>Send Details</b>
                                      </h1>
                                    </div>

                                    <div className="mb-2 block">
                                      <h1 className="text-md text-gray-700">
                                        <b>Shop Name : </b>{" "}
                                        {shops.map((shop) => {
                                          if (shop.id == formData.shopId) {
                                            return shop.shopName;
                                          }
                                        })}
                                      </h1>
                                    </div>

                                    <div className="block">
                                      <h1 className="text-md text-gray-700">
                                        <div className="flex gap-3 ">
                                          <p>
                                            <b>Quantity : </b>{" "}
                                          </p>
                                          {formData.quantity > 0 ? (
                                            <Badge
                                              size="sm"
                                              className="pl-3 pr-3"
                                              color={
                                                formData.quantity ==
                                                selectedProduct.quantity
                                                  ? "red"
                                                  : "yellow"
                                              }
                                              icon={HiCheckCircle}
                                            >
                                              {formData.quantity} Items
                                            </Badge>
                                          ) : (
                                            ""
                                          )}
                                        </div>
                                      </h1>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                          <div className="w-1/2">
                            <div className="mb-2 block">
                              <Label value="Select Shop" />
                            </div>
                            <Select
                              id="shopId"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  shopId: e.target.value,
                                })
                              }
                              required
                              shadow
                            >
                              <option value="no">Select a Shop </option>
                              {shops
                                .filter((shop) => shop.id !== shopId) // Exclude the current shop
                                .map((shop) => (
                                  <option key={shop.id} value={shop.id}>
                                    {shop.shopName}
                                  </option>
                                ))}
                            </Select>
                          </div>
                          <div className="w-1/2">
                            <div className="mb-2 block">
                              <Label value="Item Quantity" />
                            </div>

                            <TextInput
                              id="quantity"
                              type="number"
                              placeholder="10"
                              required
                              shadow
                              onChange={handleChange}
                              defaultValue={1}
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              handleSubmit(formData, selectedProduct);
                            }}
                            color="blue"
                            disabled={
                              createLoding || error || formData.shopId === "no"
                            }
                          >
                            {createLoding ? (
                              <>
                                <Spinner size="sm" />
                                <span className="pl-3">Loading...</span>
                              </>
                            ) : (
                              "Send Stock"
                            )}
                            <HiPaperAirplane className="ml-2 h-4 w-4 rotate-90" />
                          </Button>
                          <Button
                            size="sm"
                            color="gray"
                            onClick={() => handelClear()}
                          >
                            Decline
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Modal.Body>
                </motion.div>
              </Modal>

              {filteredProducts.length > 0 ? (
                <>
                  <Table hoverable className="mt-2 shadow-md w-full">
                    <TableHead>
                      <TableHeadCell>Product Name</TableHeadCell>
                      <TableHeadCell>SKU</TableHeadCell>
                      <TableHeadCell>Manufacturer</TableHeadCell>
                      <TableHeadCell>Price</TableHeadCell>
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
                            <b>{product.itemDetails.itemName}</b>
                          </TableCell>
                          <TableCell>{product.itemDetails.sku}</TableCell>
                          <TableCell>
                            {product.itemDetails.manufacturer}
                          </TableCell>
                          <TableCell>
                            Rs. {product.itemDetails.itemPrice}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                className="pl-3 pr-3  w-28"
                                color={product.quantity > 0 ? "green" : "red"}
                                icon={
                                  product.quantity > 0
                                    ? HiCheckCircle
                                    : HiXCircle
                                }
                              >
                                {product.quantity} in stock
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="pl-3 pr-3 w-28"
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
                              <p className=" capitalize">{product.status}</p>
                            </Badge>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                setOpenModal(true);
                                setSelectedProduct(product);
                              }}
                              disabled={
                                product.quantity === 0 ||
                                product.status !== "approved"
                              }
                              color="blue"
                            >
                              Send Stock
                              <HiPaperAirplane className="ml-3 h-4 w-4 rotate-90" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </Table.Body>
                    ))}
                  </Table>
                </>
              ) : (
                <div className="flex justify-center items-center h-96">
                  <p className="text-gray-400">You have no data yet!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
