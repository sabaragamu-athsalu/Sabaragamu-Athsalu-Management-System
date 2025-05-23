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
  Pagination,
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
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function DashStores() {
  const { currentUser } = useSelector((state) => state.user);
  const [stores, setStores] = useState([]);
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
  const itemsPerPage = 5;
  const totalPages = Math.ceil(skeeperMstores.length / itemsPerPage);

  const onPageChange = (page) => setCurrentPage(page);

  const currentData = skeeperMstores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination

  //fetch StoreKeeperManageStore data
  const fetchStoreKeeperManageStore = async () => {
    try {
      const res = await fetch(`/api/associations/getAllStoreswithStorekeepers`);

      const data = await res.json();

      const skeeperMstores = data.data.map((store) => ({
        id: store.id,
        storeName: store.storeName,
        phone: store.phone,
        address: store.address,
        storeKeeperFirstName:
          store.storeKeeper.map((sk) => sk.firstname).length > 0
            ? store.storeKeeper.slice(-1).map((sk) => sk.firstname)
            : "No Store Keeper Assigned",
        storeKeeperManageStoreDate: store.storeKeeper.map(
          (sk) => sk.StoreKeeperManageStore.date
        )
          ? new Date(
              store.storeKeeper
                .slice(-1)
                .map((sk) => sk.StoreKeeperManageStore.date)
            ).toLocaleDateString()
          : "Not Assign Yet",
      }));

      if (res.ok) {
        setstoreStoreKeeper(skeeperMstores);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //add data to the storekeeperassigntore async
  const handleAssignStoreKeeper = async (e) => {
    e.preventDefault();
    setCreateLoding(true);
    try {
      const res = await fetch(`/api/storekeepermanagestore/assignstorekeeper`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateUserError(data.message);
        setCreateLoding(false);
        return;
      }

      if (res.ok) {
        setCreateUserError(null);
        setCreateLoding(false);
        setOpenModalAssignStoreKeeper(false);
        fetchStores();
        fetchStoreKeeper();
        fetchStoreKeeperManageStore();
      }
    } catch (error) {
      // setCreateUserError("Something went wrong");
      setCreateLoding(false);
    }
    fetchStores();
    fetchStoreKeeper();
    fetchStoreKeeperManageStore();
  };

  const fetchStoreKeeper = async () => {
    try {
      const res = await fetch(`/api/user/getstorekeepers`);
      const data = await res.json();
      if (res.ok) {
        setStoreKeeper(data.storekeepers);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchStores = async () => {
    try {
      setCreateLoding(true);
      const res = await fetch(`/api/store/getStores`);
      const data = await res.json();
      if (res.ok) {
        setStores(data.stores);
        setCreateLoding(false);
        // if (data.store.length < 9) {
        //   setShowMore(false);
        // }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (currentUser.role == "Admin" || currentUser.role == "Director") {
      fetchStores();
      fetchStoreKeeper();
      fetchStoreKeeperManageStore();
    }
  }, [stores.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateLoding(true);
    try {
      const res = await fetch("/api/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateUserError(data.message);
        setCreateLoding(false);
        return;
      }

      if (res.ok) {
        setCreateUserError(null);
        setCreateLoding(false);
        setOpenModal(false);
        fetchStores();
        fetchStoreKeeper();
        fetchStoreKeeperManageStore();
      }
    } catch (error) {
      // setCreateUserError("Something went wrong");
      setCreateLoding(false);
    }

    fetchStores();
    fetchStoreKeeper();
    fetchStoreKeeperManageStore();
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setCreateLoding(true);
    console.log(formData.id);
    try {
      const res = await fetch(`/api/store/updatestore/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateUserError(data.message);
        setCreateLoding(false);
        return;
      }

      if (res.ok) {
        setCreateUserError(null);
        setCreateLoding(false);
        setOpenModalEdit(false);
        // fetchStores();
        // navigate("/dashboard?tab=store");
        fetchStores();
        fetchStoreKeeper();
        fetchStoreKeeperManageStore();
      }
    } catch (error) {
      // setCreateUserError("Something went wrong");
      setCreateLoding(false);
    }

    fetchStores();
    fetchStoreKeeper();
    fetchStoreKeeperManageStore();
  };

  const handleDeleteStore = async () => {
    try {
      const res = await fetch(`/api/store/deletestore/${storeIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setStores((prev) =>
          prev.filter((store) => store.id !== storeIdToDelete)
        );
        setShowModal(false);
        fetchStores();
        fetchStoreKeeper();
        fetchStoreKeeperManageStore();
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }

    fetchStores();
    fetchStoreKeeper();
    fetchStoreKeeperManageStore();
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
            <Breadcrumb.Item>Stores</Breadcrumb.Item>
          </Breadcrumb>

          <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
            All Stores
          </h1>
          <div className="flex gap-3 justify-end">
            <Button
              className="mb-3"
              color="blue"
              size="sm"
              onClick={() => setOpenModal(true)}
              style={{
                display:
                  currentUser.role === "Director" ? "none" : "inline-block",
              }}
            >
              <HiPlusCircle className="mr-2 h-4 w-4" />
              Add Stores
            </Button>
            <Button
              className="mb-3"
              color="blue"
              size="sm"
              onClick={() => setOpenModalAssignStoreKeeper(true)}
              style={{
                display:
                  currentUser.role === "Director" ? "none" : "inline-block",
              }}
            >
              <HiPlusCircle className="mr-2 h-4 w-4" />
              Assign Store Keeper
            </Button>
          </div>

          <Modal
            show={openModalAssignStoreKeeper}
            onClose={() => setOpenModalAssignStoreKeeper(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Modal.Header>Assign Store Keeper</Modal.Header>
              <Modal.Body>
                <div className="space-y-6">
                  <form
                    onSubmit={handleAssignStoreKeeper}
                    className="flex flex-col flex-grow gap-4"
                  >
                    {createUserError && (
                      <Alert color="failure">{createUserError}</Alert>
                    )}
                    <div className="flex gap-2 mb-4">
                      <div className="w-1/3">
                        <div className="mb-2 block">
                          <Label value="Store Name" />
                        </div>
                        <Select
                          id="storeId"
                          required
                          shadow
                          onChange={handleChange}
                        >
                          <option value="">Select Store</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.storeName}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="w-1/3">
                        <div className="mb-2 block">
                          <Label value="Store Keeper Name" />
                        </div>
                        <Select
                          id="storeKeeperId"
                          required
                          shadow
                          onChange={handleChange}
                        >
                          <option value="">Select Store Keeper</option>
                          {storeKeeper.map((storekeeper) => (
                            <option key={storekeeper.id} value={storekeeper.id}>
                              {storekeeper.firstname}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="w-1/3">
                        <div className="mb-2 block">
                          <Label value="Date" />
                        </div>
                        <TextInput
                          id="date"
                          type="date"
                          required
                          shadow
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        color="blue"
                        type="submit"
                        disabled={createLoding}
                      >
                        {createLoding ? (
                          <>
                            <Spinner size="sm" />
                            <span className="pl-3">Loading...</span>
                          </>
                        ) : (
                          "Assign Store Keeper"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        color="gray"
                        onClick={() => setOpenModalAssignStoreKeeper(false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </form>
                </div>
              </Modal.Body>
            </motion.div>
          </Modal>

          <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Modal.Header>Create New Store</Modal.Header>
              <Modal.Body>
                <div className="space-y-6">
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-grow gap-4"
                  >
                    {createUserError && (
                      <Alert color="failure">{createUserError}</Alert>
                    )}
                    <div className="flex gap-2 mb-4">
                      <div>
                        <div className="mb-2 block">
                          <Label value="Store Name" />
                        </div>
                        <TextInput
                          id="storeName"
                          type="text"
                          placeholder="Main Store"
                          required
                          shadow
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <div className="mb-2 block">
                          <Label value="Store Address" />
                        </div>
                        <TextInput
                          id="address"
                          type="text"
                          placeholder="Raathnapura"
                          required
                          shadow
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <div className="mb-2 block">
                          <Label value="Phone Number" />
                        </div>
                        <TextInput
                          id="phone"
                          type="text"
                          placeholder="+94XX XXX XXXX"
                          required
                          shadow
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        color="blue"
                        type="submit"
                        disabled={createLoding}
                      >
                        {createLoding ? (
                          <>
                            <Spinner size="sm" />
                            <span className="pl-3">Loading...</span>
                          </>
                        ) : (
                          "Create Stores"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        color="gray"
                        onClick={() => setOpenModal(false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </form>
                </div>
              </Modal.Body>
            </motion.div>
          </Modal>

          <Modal show={openModalEdit} onClose={() => setOpenModalEdit(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Modal.Header>Edit Store</Modal.Header>
              <Modal.Body>
                <div className="space-y-6">
                  <form
                    onSubmit={handleSubmitUpdate}
                    className="flex flex-col flex-grow gap-4"
                  >
                    {createUserError && (
                      <Alert color="failure">{createUserError}</Alert>
                    )}
                    <div className="flex gap-2 mb-4">
                      <div>
                        <div className="mb-2 block">
                          <Label value="Store Name" />
                        </div>
                        <TextInput
                          id="storeName"
                          type="text"
                          placeholder="Main Store"
                          required
                          shadow
                          onChange={handleChange}
                          value={formData.storeName}
                        />
                      </div>
                      <div>
                        <div className="mb-2 block">
                          <Label value="Store Address" />
                        </div>
                        <TextInput
                          id="address"
                          type="text"
                          placeholder="Raathnapura"
                          required
                          shadow
                          onChange={handleChange}
                          value={formData.address}
                        />
                      </div>
                      <div>
                        <div className="mb-2 block">
                          <Label value="Store Phone Number" />
                        </div>
                        <TextInput
                          id="phone"
                          type="text"
                          placeholder="+94XX XXX XXXX"
                          required
                          shadow
                          onChange={handleChange}
                          value={formData.phone}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        color="blue"
                        type="submit"
                        disabled={createLoding}
                      >
                        {createLoding ? (
                          <>
                            <Spinner size="sm" />
                            <span className="pl-3">Loading...</span>
                          </>
                        ) : (
                          "Update Store"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        color="gray"
                        onClick={() => setOpenModalEdit(false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </form>
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
              {currentUser.role == "Admin" ||
              (currentUser.role == "Director" && currentData.length > 0) ? (
                <>
                  <Table hoverable className="shadow-md w-full">
                    <TableHead>
                      <TableHeadCell>Store ID</TableHeadCell>
                      <TableHeadCell>Store Name</TableHeadCell>
                      <TableHeadCell>Address</TableHeadCell>
                      <TableHeadCell>Phone Number</TableHeadCell>
                      <TableHeadCell>Store Keeper Name</TableHeadCell>
                      <TableHeadCell>Date of Assign</TableHeadCell>
                      <TableHeadCell>
                        <span className="sr-only">Edit</span>
                      </TableHeadCell>
                    </TableHead>
                    {currentData.map((store) => (
                      <Table.Body className="divide-y" key={store.id}>
                        <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <TableCell>ST:{store.id}</TableCell>
                          <TableCell>{store.storeName}</TableCell>
                          <TableCell>{store.address}</TableCell>
                          <TableCell>{store.phone}</TableCell>
                          <TableCell>{store.storeKeeperFirstName}</TableCell>
                          <TableCell>
                            {store.storeKeeperManageStoreDate}
                          </TableCell>
                          <TableCell>
                            <Button.Group>
                              <Button
                                onClick={() => {
                                  setOpenModalEdit(true);
                                  setFormData(store);
                                }}
                                color="gray"
                                style={{
                                  display:
                                    currentUser.role === "Director"
                                      ? "none"
                                      : "inline-block",
                                }}
                              >
                                <FaUserEdit className="mr-3 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                disabled
                                onClick={() => {
                                  setShowModal(true);
                                  setStoreIdToDelete(store.id);
                                }}
                                color="gray"
                                style={{
                                  display:
                                    currentUser.role === "Director"
                                      ? "none"
                                      : "inline-block",
                                }}
                              >
                                <MdDeleteForever className="mr-3 h-4 w-4" />
                                Delete
                              </Button>
                            </Button.Group>
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
                  {/* {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center text-sm py-7"
            >
              Show more
            </button>
          )} */}
                </>
              ) : (
                <div className="flex justify-center items-center h-96">
                  <p className="text-gray-400">You have no data yet!</p>
                </div>
              )}
            </>
          )}

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
                    Are you sure you want to delete this user?
                  </h3>
                  <div className="flex justify-center gap-4">
                    <Button color="failure" onClick={handleDeleteStore}>
                      Yes, I'm sure
                    </Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                      No, cancel
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </motion.div>
          </Modal>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
