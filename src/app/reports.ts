import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { toggleAnimation } from "src/app/shared/animations";
import { AppointmentService } from "./service/appointment.service"; // Adjust the path accordingly
import { HttpClient } from "@angular/common/http";
import Swal from "sweetalert2";
import { finalize } from "rxjs/operators";
import { ApiService } from 'src/app/api.service';

interface HealthService {
  id: string;
  section_name: string;
}

@Component({
  selector: "app-reports",
  templateUrl: "./reports.html",
  animations: [toggleAnimation],
})
export class ReportsComponent {
  rows: any[] = [];
  isLoading = true;
  codeArr: any = [];
  consultants: any[] = [];
  branches: any[] = [];
  healthServices: HealthService[] = [];
  selectedConsultantId: number | null = null;
  selectedBranchId: number | null = null;
  noDataAvailable: boolean = false;
  selectedDate: string = "";
  selectedHealthServiceId: string = "";

  // Toggle Code Logic
  toggleCode = (name: string) => {
    if (this.codeArr.includes(name)) {
      this.codeArr = this.codeArr.filter((d: string) => d != name);
    } else {
      this.codeArr.push(name);
    }
  };

  // Search Variables
  search1 = "";
  search2 = "";
  search3 = "";

  datatable1Cols = [
    { field: "id", title: "Sr.No" },
    { field: "branch_name", title: "Branch" },
    { field: "consultant_name", title: "Consultant" },
    { field: "healthservices", title: "Health Services" },
    { field: "full_name", title: "Patient Name" },
    { field: "date", title: "Date" },
    { field: "slots_time", title: "Slot Time" },
    { field: "mobile_no", title: "Mobile No" },
  ];

  datatable2Cols = [
    { field: "id", title: "Sr.No" },
    { field: "dob", title: "Slot Time" },
  ];

  datatable3Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "company", title: "Consultant" },
    { field: "age", title: "Health Issues" },
    { field: "dob", title: "Slot Time" },
    { field: "phone", title: "Phone No." },
  ];

  datatable4Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "company", title: "Consultant" },
    { field: "age", title: "Health Issues" },
    { field: "dob", title: "Slot Time" },
    { field: "phone", title: "Phone No." },
  ];

  datatable5Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "age", title: "Health Issues" },
    { field: "company", title: "Company" },
    { field: "dob", title: "Start Date" },
    { field: "email", title: "Email" },
    { field: "phone", title: "Phone No." },
  ];

  // Component Initialization
  ngOnInit(): void {
    this.fetchBranches();
    this.fetchConsultants();
    this.fetchServices();
    this.fetchAllAppointments();
  }

  onConsultantChange(event: any) {
    this.selectedConsultantId = +event.target.value;
  }

  onBranchChange(event: any) {
    this.selectedBranchId = +event.target.value;
  }

  onServiceChange(event: Event) {
    this.selectedHealthServiceId = (event.target as HTMLSelectElement).value;
    // Perform any additional logic you want when the health service is selected
  }

  // Date Formatting Function
  formatDate(date: any) {
    if (date) {
      const dt = new Date(date);
      const month =
        dt.getMonth() + 1 < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1;
      const day = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
      return day + "/" + month + "/" + dt.getFullYear();
    }
    return "";
  }

  // Random Color Generator
  randomColor() {
    const color = [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
    ];
    const random = Math.floor(Math.random() * color.length);
    return color[random];
  }

  // Random Status Generator
  randomStatus() {
    const status = [
      "PAID",
      "APPROVED",
      "FAILED",
      "CANCEL",
      "SUCCESS",
      "PENDING",
      "COMPLETE",
    ];
    const random = Math.floor(Math.random() * status.length);
    return status[random];
  }

  // Tabs Setup
  tab1: string = "home";
  tab2: string = "home";

  tab12: string = "home";

  // Store Variables for Dynamic Changes
  store: any;
  bitcoin: any;
  ethereum: any;
  litecoin: any;
  binance: any;
  tether: any;
  solana: any;

  constructor(
    private appointmentService: AppointmentService,
    public storeData: Store<any>,
    private http: HttpClient,
    private apiService: ApiService,
  ) {
    this.initStore();
    this.isLoading = false;
  }

  // Store Initialization
  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        const hasChangeTheme = this.store?.theme !== d?.theme;
        const hasChangeLayout = this.store?.layout !== d?.layout;
        const hasChangeMenu = this.store?.menu !== d?.menu;
        const hasChangeSidebar = this.store?.sidebar !== d?.sidebar;

        this.store = d;

        if (
          hasChangeTheme ||
          hasChangeLayout ||
          hasChangeMenu ||
          hasChangeSidebar
        ) {
          if (this.isLoading || hasChangeTheme) {
            this.initCharts(); //init charts
          } else {
            setTimeout(() => {
              this.initCharts(); // refresh charts
            }, 300);
          }
        }
      });
  }

  // Chart Initialization for different currencies
  initCharts() {
    // Bitcoin Chart
    this.bitcoin = {
      chart: {
        height: 45,
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: { width: 2 },
      markers: { size: 0 },
      colors: ["#00ab55"],
      grid: { padding: { top: 0, bottom: 0, left: 0 } },
      tooltip: {
        x: { show: false },
        y: { title: { formatter: (val: any) => "" } },
      },
      responsive: [
        {
          breakPoint: 576,
          options: {
            chart: { height: 95 },
            grid: { padding: { top: 45, bottom: 0, left: 0 } },
          },
        },
      ],
      series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66] }],
    };

    // Ethereum Chart
    this.ethereum = {
      chart: {
        height: 45,
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: { width: 2 },
      markers: { size: 0 },
      colors: ["#0088ff"],
      grid: { padding: { top: 0, bottom: 0, left: 0 } },
      tooltip: {
        x: { show: false },
        y: { title: { formatter: (val: any) => "" } },
      },
      responsive: [
        {
          breakPoint: 576,
          options: {
            chart: { height: 95 },
            grid: { padding: { top: 45, bottom: 0, left: 0 } },
          },
        },
      ],
      series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66] }],
    };

    // Litecoin Chart
    this.litecoin = {
      chart: {
        height: 45,
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: { width: 2 },
      markers: { size: 0 },
      colors: ["#ff6200"],
      grid: { padding: { top: 0, bottom: 0, left: 0 } },
      tooltip: {
        x: { show: false },
        y: { title: { formatter: (val: any) => "" } },
      },
      responsive: [
        {
          breakPoint: 576,
          options: {
            chart: { height: 95 },
            grid: { padding: { top: 45, bottom: 0, left: 0 } },
          },
        },
      ],
      series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66] }],
    };

    // Binance Chart
    this.binance = {
      chart: {
        height: 45,
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: { width: 2 },
      markers: { size: 0 },
      colors: ["#ff7c00"],
      grid: { padding: { top: 0, bottom: 0, left: 0 } },
      tooltip: {
        x: { show: false },
        y: { title: { formatter: (val: any) => "" } },
      },
      responsive: [
        {
          breakPoint: 576,
          options: {
            chart: { height: 95 },
            grid: { padding: { top: 45, bottom: 0, left: 0 } },
          },
        },
      ],
      series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66] }],
    };

    // Tether Chart
    this.tether = {
      chart: {
        height: 45,
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: { width: 2 },
      markers: { size: 0 },
      colors: ["#8f00ff"],
      grid: { padding: { top: 0, bottom: 0, left: 0 } },
      tooltip: {
        x: { show: false },
        y: { title: { formatter: (val: any) => "" } },
      },
      responsive: [
        {
          breakPoint: 576,
          options: {
            chart: { height: 95 },
            grid: { padding: { top: 45, bottom: 0, left: 0 } },
          },
        },
      ],
      series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66] }],
    };

    // Solana Chart
    this.solana = {
      chart: {
        height: 45,
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: { width: 2 },
      markers: { size: 0 },
      colors: ["#ff1f0f"],
      grid: { padding: { top: 0, bottom: 0, left: 0 } },
      tooltip: {
        x: { show: false },
        y: { title: { formatter: (val: any) => "" } },
      },
      responsive: [
        {
          breakPoint: 576,
          options: {
            chart: { height: 95 },
            grid: { padding: { top: 45, bottom: 0, left: 0 } },
          },
        },
      ],
      series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66] }],
    };
  }

  fetchBranches() {
    // this.http.get<any>("http://localhost/OPDClinic/read/tbl_branch").subscribe(
      this.apiService.get("read/tbl_branch").subscribe(
        (response) => {
          if (response.status === 200) {
            this.branches = response.data;
          } else {
            console.error("Error fetching branches:", response.message);
          }
        },
        (error) => {
          console.error("Error fetching branches:", error);
        }
      );
  }

  fetchConsultants() {
    const role = "Consultant"; // Define the role you want to filter by
    const endpoint = `get_where_condition_data/tbl_register/${role}`;
    this.apiService.get(endpoint).subscribe(
    // this.http.get<any>(`http://localhost/OPDClinic/get_where_condition_data/tbl_register/${role}`).subscribe(
        (response) => {
          if (response.status === 200) {
            this.consultants = response.data; // Assign the fetched consultants
          } else {
            console.error("Error fetching consultants:", response.message);
          }
        },
        (error) => {
          console.error("Error fetching consultants:", error);
        }
      );
  }

  fetchServices() {
    const endpoint = `read/tbl_section`;
    this.apiService.get(endpoint).subscribe(
    // this.http.get<any>("http://localhost/OPDClinic/read/tbl_section").subscribe(
        (response) => {
          if (response.status === 200) {
            this.healthServices = response.data;
          } else {
            console.error("Error fetching services:", response.message);
          }
        },
        (error) => {
          console.error("Error fetching services:", error);
        }
      );
  }
  fetchAllAppointments() {
    this.isLoading = true;

    this.appointmentService
      .getAppointmentsWithSlots()
      .subscribe(
        (response) => {
          console.log(response);
          if (response.status === 200) {
            this.rows = response.data; // Set the joined data to rows
          }
          this.isLoading = false;
        },
        (error) => {
          console.error("Error fetching appointments with slots:", error);
          this.isLoading = false;
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }
  resetForm() {
    // Reset all the search variables
    this.search1 = "";
    this.search2 = "";
    this.search3 = "";

    // Reset any selected filters
    this.selectedConsultantId = null;
    this.selectedBranchId = null;
    this.selectedHealthServiceId = "";
    this.selectedDate = "";

    // Reset any other form or data variables as needed
    this.noDataAvailable = false;

    // Optionally, you can clear any code toggles as well
    this.codeArr = [];

    // If you need to re-fetch or reset data as part of the reset:
    this.fetchAllAppointments();
    this.fetchBranches(); // Re-fetch branches if necessary
    this.fetchConsultants(); // Re-fetch consultants if necessary
    this.fetchServices(); // Re-fetch services if necessary
  }

  public fetchAppointments(tab: string) {
    this.isLoading = true; // Start the loading spinner

    // Prepare the filters based on the selected tab and input
    const filters: any = {
      consultantId: this.selectedConsultantId || null, // Selected consultant
      branchId: this.selectedBranchId || null, // Selected branch
      date: this.selectedDate || null, // Selected date
      serviceId: this.selectedHealthServiceId || null, // Selected health service
      tab: tab, // Current tab
    };

    // Apply filters specific to each tab
    switch (tab) {
      case "home":
        // "Home" tab doesn't need additional processing
        break;
      case "upcoming":
        // Default date to today if not explicitly selected
        filters.date = filters.date || new Date().toISOString().split("T")[0];
        break;
      case "contact":
        // Add any specific filters for the "contact" tab here
        break;
      case "cancelled":
        // Add any specific filters for the "cancelled" tab here
        break;
      default:
        console.error("Unknown tab selected");
        this.isLoading = false; // Stop loading for invalid tabs
        return;
    }

    // Make the HTTP POST request
    const endpoint = `get_filtered_report/tbl_appointment`;
    // this.apiService.post(endpoint,filters).subscribe(

    // this.http.post("http://localhost/OPDClinic/get_filtered_report/tbl_appointment",filters).pipe(
      this.apiService.post(endpoint,filters).pipe(
    finalize(() => {
          this.isLoading = false; // Stop the loading spinner after the request completes
        })
      )
      .subscribe(
        (response: any) => {
          console.log("Fetch Response:", response); // Debugging response data

          if (response.status === 200) {
            // Populate the data into `rows` based on the current tab
            this.rows = response.data || [];
            this.noDataAvailable = this.rows.length === 0; // Check for empty data

            // Show a "No data available" message if no rows exist
            if (this.noDataAvailable) {
              this.showMessage("No data available", "info");
            }
          } else {
            // console.error("Error in response:", response.message);

            this.rows = []; // Clear data on error
            this.noDataAvailable = true;
            this.showMessage("No data available", "info");
          }
        },
        (error: any) => {
          // Handle errors from the HTTP request
          // console.error("Error fetching appointments:", error);
          this.rows = []; // Clear data on error
          this.noDataAvailable = true;
          this.showMessage("Error fetching data. Please try again.", "error");
        }
      );
  }

  showMessage(msg = "", type = "success") {
    const toast: any = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: "toast" },
    });
    toast.fire({
      icon: type,
      title: msg,
      padding: "10px 20px",
    });
  }
}
