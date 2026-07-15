import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import DataTable from 'react-data-table-component';
import moment from 'moment';

function UsersList() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Axios.get(`${baseURL}/user/get-users-list.php`)
      .then(response => {
        setUsers(response.data.users || []);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

   const columns = [
    {
      name: 'Avatar',
      cell: row => (
        <img
          src={
            row.avatar
              ? `${baseURL}/user/uploads/${row.avatar}`
              : `${baseURL}/user/uploads/default_avatar.png`
          }
          alt="avatar"
          width="40"
          height="40"
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      ),
    },
    {
      name: 'Name',
      selector: row => `${row.first_name} ${row.last_name} (${row.username})`,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    
    {
      name: 'Status',
      cell: row => (
        <span className={`badge ${row.is_paused === '1' ? 'bg-danger' : 'bg-success'}`}>
          {row.is_paused === '1' ? 'Inactive' : 'Active'}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Registered',
      selector: row => row.createdAt,
      cell: row => row.createdAt && row.createdAt !== '0000-00-00 00:00:00'
        ? moment(row.createdAt).format('MMM D, YYYY h:mm A')
        : '-',
      sortable: true,
    },
  ];

  const activeCount = users.filter(user => user.is_paused !== '1').length;
  const inactiveCount = users.filter(user => user.is_paused === '1').length;

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Users List</h3>
      <div className="mb-3">
        <span className="badge bg-success me-2">Active: {activeCount}</span>
        <span className="badge bg-danger">Inactive: {inactiveCount}</span>
      </div>
      <DataTable
        columns={columns}
        data={users}
        pagination
        highlightOnHover
        responsive
        defaultSortField="username"
      />
    </div>
  );
}
export default UsersList;
