import { useState, useEffect } from 'react';
import Data from './data.csv';
import Papa from 'papaparse';
import './App.css'

function App() {
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]); // Aggregated data
  const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'ascending' });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(Data);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value);
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      }).data;

      setData(parsedData);

      // Group data by year and calculate total jobs and average salary
      const aggregatedData = parsedData.reduce((acc, job) => {
        const year = job.work_year;
        const salary = parseFloat(job.salary_in_usd);

        if (!acc[year]) {
          acc[year] = { year, totalJobs: 0, totalSalary: 0 };
        }

        acc[year].totalJobs += 1;
        acc[year].totalSalary += salary;

        return acc;
      }, {});

      // Transform aggregatedData into an array and calculate average salary
      const resultTableData = Object.values(aggregatedData).map((item) => ({
        year: item.year,
        totalJobs: item.totalJobs,
        averageSalary: (item.totalSalary / item.totalJobs).toFixed(2),
      }));

      setTableData(resultTableData);
    };

    fetchData();
  }, []);

  const sortTable = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedData = [...tableData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setTableData(sortedData);
  };

  return (
    <div className="App">
      {/* Aggregated Data Table */}
      {tableData.length ? (
        <div className="aggregated-data-table">
          <h2>Main Table</h2>
          <table className="main-table">
            <thead>
              <tr>
                <th onClick={() => sortTable('year')}>Year</th>
                <th onClick={() => sortTable('totalJobs')}>Number of Jobs</th>
                <th onClick={() => sortTable('averageSalary')}>Average Salary (USD)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.year}</td>
                  <td>{row.totalJobs}</td>
                  <td>{row.averageSalary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Full CSV Data Table */}
      {data.length ? (
        <div className="full-data-table">
          <h2>Full CSV Data</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Work Year</th>
                <th>Experience Level</th>
                <th>Employment Type</th>
                <th>Job Title</th>
                <th>Salary</th>
                <th>Salary Currency</th>
                <th>Salary in USD</th>
                <th>Employee Residence</th>
                <th>Remote Ratio</th>
                <th>Company Location</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.work_year}</td>
                  <td>{row.experience_level}</td>
                  <td>{row.employment_type}</td>
                  <td>{row.job_title}</td>
                  <td>{row.salary}</td>
                  <td>{row.salary_currency}</td>
                  <td>{row.salary_in_usd}</td>
                  <td>{row.employee_residence}</td>
                  <td>{row.remote_ratio}</td>
                  <td>{row.company_location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default App;

