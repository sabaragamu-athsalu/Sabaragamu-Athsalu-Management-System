import { React, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Badge,
} from "flowbite-react";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
import "react-circular-progressbar/dist/styles.css";
import {
  HiOutlineExclamationCircle,
  HiPlusCircle,
  HiUserAdd,
  HiXCircle,
  HiCheckCircle,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { FaFileCircleCheck } from "react-icons/fa6";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { MdCancel } from "react-icons/md";

export default function DashSellerProducts() {
  const { currentUser } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const shopIdRes = await fetch(`/api/shop/getshop/${currentUser.id}`);
      const shopIdData = await shopIdRes.json();
      if (shopIdRes.ok) {
        const productsRes = await fetch(
          `/api/shop-item/getshopitems/${shopIdData.shops[0].id}`
        );
        const productsData = await productsRes.json();
        if (productsRes.ok) {
          setProducts(productsData.shopItems);
          if (productsData.shopItems.length < 9) {
            setShowMore(false);
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser.id]);

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
            <Breadcrumb.Item>Shop Products</Breadcrumb.Item>
          </Breadcrumb>

          <h1 className="mt-3 mb-5 text-left font-semibold text-xl">
            Shop Products
          </h1>

          {products.length > 0 ? (
            <>
              <Table hoverable className="shadow-md w-full">
                <TableHead>
                  <TableHeadCell>Product Name</TableHeadCell>
                  <TableHeadCell>SKU</TableHeadCell>
                  <TableHeadCell>Type</TableHeadCell>
                  <TableHeadCell>Manufacturer</TableHeadCell>

                  <TableHeadCell>Quantity</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Price</TableHeadCell>
                </TableHead>
                {products.map((product) => (
                  <Table.Body className="divide-y" key={product.id}>
                    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <TableCell>
                        <b>{product.itemDetails.itemName}</b>
                      </TableCell>
                      <TableCell>{product.itemDetails.sku}</TableCell>
                      <TableCell>{product.itemDetails.itemType}</TableCell>
                      <TableCell>{product.itemDetails.manufacturer}</TableCell>
                      <TableCell>
                        <Badge
                          className="pl-3 pr-3 w-28"
                          color={product.quantity > 0 ? "green" : "red"}
                          icon={
                            product.quantity > 0 ? HiCheckCircle : HiXCircle
                          }
                        >
                          {product.quantity} in stock
                        </Badge>
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
                      <TableCell>Rs. {product.itemDetails.itemPrice}</TableCell>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
