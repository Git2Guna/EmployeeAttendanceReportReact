import React, { useState, useEffect } from "react";
import "./App.css";
import { FaTrash, FaEdit } from "react-icons/fa";
import unemploymentImg from "./assets/unemployment.png";

function App() {
  const [employees, setEmployees] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gender: "",
    department: "",
    attendance: "",
    profile: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileKey, setFileKey] = useState(Date.now());

  // Popup state
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ visible: false, empId: null });

  // Load employees
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("employees"));
    if (stored) setEmployees(stored);
    setIsLoaded(true);
  }, []);

  // Save employees
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("employees", JSON.stringify(employees));
    }
  }, [employees, isLoaded]);

  // Show popup function
  const showPopup = (message, type) => {
    setPopup({ message, type, visible: true });
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profile: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { id, name, gender, department, attendance, profile } = formData;

    if (!id || !name || !gender || !department || !attendance) {
      showPopup("Please fill all fields", "delete");
      return;
    }

    if (!editingId && !profile) {
      showPopup("Profile image required", "delete");
      return;
    }

    if (editingId !== null) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id.toString() === editingId.toString() ? formData : emp
        )
      );
      setEditingId(null);
      showPopup("Employee updated successfully", "update");
    } else {
      if (employees.some((emp) => emp.id.toString() === id.toString())) {
        showPopup("Employee ID already exists", "delete");
        return;
      }
      setEmployees((prev) => [...prev, formData]);
      showPopup("Employee added successfully", "success");
    }

    setFormData({
      id: "",
      name: "",
      gender: "",
      department: "",
      attendance: "",
      profile: "",
    });
    setFileKey(Date.now());
  };

  const editEmployee = (emp) => {
    setFormData(emp);
    setEditingId(emp.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setDeleteModal({ visible: true, empId: id });
  };

  // Confirm delete
  const confirmDelete = () => {
    const id = deleteModal.empId;
    setEmployees((prev) => prev.filter((emp) => emp.id.toString() !== id.toString()));
    setDeleteModal({ visible: false, empId: null });
    showPopup("Employee deleted successfully", "delete");
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({ visible: false, empId: null });
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toString().includes(searchTerm) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.gender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      <div className="container">
        <h1>Employee Attendance Report</h1>

        {/* FORM */}
        <div className="section">
          <form className="employee-form" onSubmit={handleSubmit}>
            <input
              name="id"
              placeholder="Employee ID"
              value={formData.id}
              onChange={handleChange}
              disabled={editingId !== null}
            />

            <input
              name="name"
              placeholder="Employee Name"
              value={formData.name}
              onChange={handleChange}
            />

            <div className="radio-group">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                  />
                  {g}
                </label>
              ))}
            </div>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Development</option>
              <option>Marketing</option>
            </select>

            <div className="radio-group">
              {["Present", "Absent"].map((a) => (
                <label key={a}>
                  <input
                    type="radio"
                    name="attendance"
                    value={a}
                    checked={formData.attendance === a}
                    onChange={handleChange}
                  />
                  {a}
                </label>
              ))}
            </div>

            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <button type="submit">
              {editingId !== null ? "Update Employee" : "Add Employee"}
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="section">
          <div className="search-box">
            <input
              placeholder="Search by Name, ID, Department, Gender"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Gender</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <img
                        src={emp.profile}
                        alt={emp.name}
                        className={`profile-img ${
                          emp.attendance === "Present" ? "present" : "absent"
                        }`}
                      />
                    </td>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.gender}</td>
                    <td
                      className={
                        emp.attendance === "Present"
                          ? "attendance-present"
                          : "attendance-absent"
                      }
                    >
                      {emp.attendance}
                    </td>
                    <td className="action-icons">
                      <button
                        className="icon-btn update-btn"
                        onClick={() => editEmployee(emp)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => openDeleteModal(emp.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    <img
                      src={unemploymentImg}
                      alt="No employees"
                      style={{ width: "150px", height: "150px", objectFit: "contain" }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup */}
      {popup.visible && (
        <div className={`popup-message ${popup.type}`}>{popup.message}</div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.visible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to delete this employee?</h3>
            <div className="modal-buttons">
              <button className="btn-yes" onClick={confirmDelete}>
                Yes
              </button>
              <button className="btn-no" onClick={cancelDelete}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
