import { Sidebar, Button, Toast } from "flowbite-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  HiArrowSmRight,
  HiChartPie,
  HiClipboardList,
  HiColorSwatch,
  HiShoppingBag,
  HiSortAscending,
  HiTable,
  HiUser,
  HiUsers,
} from "react-icons/hi";
import { HiBuildingStorefront } from "react-icons/hi2";
import { IoMdHome } from "react-icons/io";
import { MdAssignmentReturn } from "react-icons/md";
import { RiFileDamageFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { BsFillHouseAddFill } from "react-icons/bs";
import { FaFileCircleCheck } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";

import { GoChecklist } from "react-icons/go";

export default function DashSidebar() {
  const { currentUser } = useSelector((state) => state.user);
  const loaction = useLocation();
  const [count, setCount] = useState(0);
  const [countStore, setCountStore] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  const navigate = useNavigate();

  var toastCount = 0;

  const dispatch = useDispatch();

  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(loaction.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
    fetchShopItemPendingCount();
  }, [loaction.search]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchShopItemPendingCount();
      fetchStoreItemPendingCount();
    }, 5000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [currentUser]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchShopItemPendingCount = async () => {
    try {
      const res = await fetch("/api/shop-item/pending-count", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setCount(data.shopItemsCount);
        if (toastCount != data.shopItemsCount) {
          toastCount == data.shopItemsCount;
          setShowToast(true);
          toastCount = toastCount + toastCount;
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchStoreItemPendingCount = async () => {
    try {
      const res = await fetch("/api/shop-item/pending-count-shop", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setCountStore(data.shopItemsCount);
        if (toastCount != data.shopItemsCount) {
          toastCount == data.shopItemsCount;
          setShowToast(true);
          toastCount = toastCount + toastCount;
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (currentUser.role === "Director") {
      fetchShopItemPendingCount();
      fetchStoreItemPendingCount();
    }
  }, [currentUser.role]);

  return (
    <>
      <Sidebar
        aria-label="Sidebar with multi-level dropdown example"
        className="w-full md:w-56 "
      >
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              {currentUser.role != "StoreKeeper" && (
                <Link to="/dashboard?tab=dash">
                  <Sidebar.Item
                    className="mt-2 mb-2"
                    active={tab === "dash"}
                    icon={HiChartPie}
                    labelColor="dark"
                    as="div"
                  >
                    Dashboard
                  </Sidebar.Item>
                </Link>
              )}

              <Link to="/dashboard?tab=profile">
                <Sidebar.Item
                  className="mt-2 mb-2"
                  active={tab === "profile"}
                  icon={HiUser}
                  label={currentUser.role}
                  labelColor="dark"
                  as="div"
                >
                  Profile
                </Sidebar.Item>
              </Link>

              {currentUser.role === "Seller" && (
                <>
                  <Link to="/dashboard?tab=pos">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      active={tab === "pos"}
                      icon={HiColorSwatch}
                      labelColor="dark"
                      as="div"
                    >
                      POS
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=sendstock">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      active={tab === "sendstock"}
                      icon={HiSortAscending}
                      labelColor="dark"
                      as="div"
                    >
                      Send Stock
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=products">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiShoppingBag}
                      active={tab === "products"}
                    >
                      Products
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=returnItems">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={MdAssignmentReturn}
                      active={tab === "returnItems"}
                    >
                      Return Items
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=saleHistory">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiClipboardList}
                      active={tab === "saleHistory"}
                    >
                      Sales History
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=salesReport">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiTable}
                      active={tab === "salesReport"}
                    >
                      Sales Report
                    </Sidebar.Item>
                  </Link>
                </>
              )}

              <Link to="/dashboard?tab=sendhistory">
                <Sidebar.Item
                  className="mt-2 mb-2"
                  icon={IoDocuments}
                  active={tab === "sendhistory"}
                >
                  Send History
                </Sidebar.Item>
              </Link>

              {currentUser.role === "Accountant" && (
                <>
                  <Link to="/dashboard?tab=products">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiShoppingBag}
                      active={tab === "products"}
                    >
                      Products
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=saleHistory">
                    <Sidebar.Item className="mt-2 mb-2" icon={HiClipboardList}>
                      Sales History
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=salesReport">
                    <Sidebar.Item className="mt-2 mb-2" icon={HiTable}>
                      Sales Report
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=returnItems">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={MdAssignmentReturn}
                      active={tab === "returnItems"}
                    >
                      Return Items
                    </Sidebar.Item>
                  </Link>
                </>
              )}

              {currentUser.role === "Director" && (
                <>
                  <Sidebar.Collapse icon={FaFileCircleCheck} label="Approvels">
                    <Link to="/dashboard?tab=approvels-store">
                      <Sidebar.Item
                        className="mt-2 mb-2"
                        icon={HiBuildingStorefront}
                        active={tab === "approvels-store"}
                        label={countStore > 0 ? countStore : ""}
                        labelColor="red"
                      >
                        Store To Shop
                      </Sidebar.Item>
                    </Link>
                    <Link to="/dashboard?tab=approvels">
                      <Sidebar.Item
                        className="mt-2 mb-2"
                        icon={IoMdHome}
                        active={tab === "approvels"}
                        label={count > 0 ? count : ""}
                        labelColor="red"
                      >
                        Shop To Shop
                      </Sidebar.Item>
                    </Link>
                  </Sidebar.Collapse>
                  <Link to="/dashboard?tab=products">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiShoppingBag}
                      active={tab === "products"}
                    >
                      Products
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=shops">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={IoMdHome}
                      active={tab === "shops"}
                    >
                      Shops
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=stores">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiBuildingStorefront}
                      active={tab === "stores"}
                    >
                      Stores
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=saleHistory">
                    <Sidebar.Item className="mt-2 mb-2" icon={HiClipboardList}>
                      Sales History
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=salesReport">
                    <Sidebar.Item className="mt-2 mb-2" icon={HiTable}>
                      Sales Report
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=returnItems">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={MdAssignmentReturn}
                      active={tab === "returnItems"}
                    >
                      Return Items
                    </Sidebar.Item>
                  </Link>
                </>
              )}

              {currentUser.role === "Admin" && (
                <>
                  <Link to="/dashboard?tab=users">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiUsers}
                      active={tab === "users"}
                      as="div"
                    >
                      Users
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=products">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiShoppingBag}
                      active={tab === "products"}
                    >
                      Products
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=shops">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={IoMdHome}
                      active={tab === "shops"}
                    >
                      Shops
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=stores">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiBuildingStorefront}
                      active={tab === "stores"}
                    >
                      Stores
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=saleHistory">
                    <Sidebar.Item className="mt-2 mb-2" icon={HiClipboardList}>
                      Sales History
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=salesReport">
                    <Sidebar.Item className="mt-2 mb-2" icon={HiTable}>
                      Sales Report
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=returnItems">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={MdAssignmentReturn}
                      active={tab === "returnItems"}
                    >
                      Return Items
                    </Sidebar.Item>
                  </Link>
                </>
              )}

              {currentUser.role === "StoreKeeper" && (
                <>
                  <Link to="/dashboard?tab=products">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiShoppingBag}
                      active={tab === "products"}
                    >
                      Products
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=storeproducts">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={BsFillHouseAddFill}
                      active={tab === "storeproducts"}
                    >
                      Store Products
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=sendstock">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={HiSortAscending}
                      active={tab === "sendstock"}
                    >
                      Send Stock
                    </Sidebar.Item>
                  </Link>

                  <Link to="/dashboard?tab=damageproducts">
                    <Sidebar.Item
                      className="mt-2 mb-2"
                      icon={RiFileDamageFill}
                      active={tab === "damageproducts"}
                    >
                      Damage Products
                    </Sidebar.Item>
                  </Link>
                </>
              )}

              <Link onClick={handleSignout}>
                <Sidebar.Item
                  icon={HiArrowSmRight}
                  className="mt-2 mb-2 cursor-pointer"
                >
                  Sign Out
                </Sidebar.Item>
              </Link>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </motion.div>
      </Sidebar>

      {showToast && (
        <>
          {currentUser.role === "Director" && (
            <div className="fixed bottom-4 right-4 z-50">
              {count > 0 && (
                <Toast>
                  <div className="flex items-start">
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-900 dark:text-cyan-300">
                      <GoChecklist className="h-5 w-5" />
                    </div>
                    <div className="ml-3 text-sm font-normal">
                      <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        Approvel available
                      </span>
                      <div className="mb-2 text-sm font-normal">
                        Pleces check the approvels for <b>shop to shop</b>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-auto">
                          <Button
                            color="green"
                            size="xs"
                            onClick={() => navigate("/dashboard?tab=approvels")}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Toast.Toggle />
                  </div>
                </Toast>
              )}
              {countStore > 0 && (
                <Toast className="mt-4">
                  <div className="flex items-start">
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-900 dark:text-cyan-300">
                      <GoChecklist className="h-5 w-5" />
                    </div>
                    <div className="ml-3 text-sm font-normal">
                      <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        Approvel available
                      </span>
                      <div className="mb-2 text-sm font-normal">
                        Pleces check the approvels for <b>store to shop</b>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-auto">
                          <Button
                            color="green"
                            size="xs"
                            onClick={() =>
                              navigate("/dashboard?tab=approvels-store")
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Toast.Toggle />
                  </div>
                </Toast>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
