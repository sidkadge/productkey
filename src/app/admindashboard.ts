import { Component, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { toggleAnimation } from "src/app/shared/animations";
import { HttpClient } from "@angular/common/http";
import Swal from "sweetalert2";
import { ChangeDetectorRef } from "@angular/core";
import { ApiService } from './api.service';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
interface Slot {
  id: number;
  slots_time: string;
  branch_id: number;
  day_name: string;
  is_deleted: string;
  created_at: string;
  doctor_id: number;
  schedule_id: number;
  serial?: number; // Optional field for serial number
}

@Component({
  selector: "app-admin-dash",
  templateUrl: "./admindashboard.html",
  animations: [toggleAnimation],
})
export class AdminDashComponent {
  codeArr: any = [];
  conductedList: any[] = []; // Initialize conductedList as an empty array
  filterdconductedsList: any = [];
  searchUser = "";
  conductedAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  cancelledAppointments: any[] = [];
  pendingStatusAppointments: any[] = [];
  slotsByDay: any = {};

  filteredRows: Slot[] = [];
  consultants: any[] = [];
  branches: any[] = [];
  selectedConsultantId: number | null = null;
  selectedBranchId: number | null = null;
  filteredAppointments: any[] = [];
  currentDate: Date = new Date();
  noDataAvailable: boolean = false;

  @ViewChild("conductedModal") conductedModal: any; // Get modal reference

  conductedData: any[] = []; // Your data source
  // paymentData = {
  //   amount: null as number | null, // Allow both number and null
  //   received: "",
  //   conductedId: null as number | null,
  // };

  paymentData = {
    conductedId: 0,
    amount: 0, // Default value
    received: "no", // Default value
  };
  // Open modal and set conductedId
  // openConductedModal(
  //   conductedId: number,
  //   price: number,
  //   paymentStatus: string
  // ) {
  //   this.paymentData = {
  //     conductedId: conductedId,
  //     amount: price,
  //     received: paymentStatus, // 'yes' or 'no'
  //   };
  //   console.log(conductedId);
  //   console.log(price);
  //   console.log(paymentStatus);
  //   this.conductedModal.open();
  // }

  // openConductedModal(conductedId: number, price: number, paymentStatus: string) {
  //   this.paymentData = {
  //     conductedId: conductedId,
  //     amount: price, // Assign price here
  //     received: paymentStatus, // 'yes' or 'no'
  //   };

  //   console.log('Conducted ID:', conductedId);
  //   console.log('Price:', price);
  //   console.log('Payment Status:', paymentStatus);

  //   this.paymentData.amount = price;
  //   this.conductedModal.open();
  // }

  openConductedModal(
    conductedId: number,
    price: number,
    paymentStatus: string
  ) {
    this.paymentData = {
      conductedId: conductedId,
      amount: price, // Use the fetched price value
      received: paymentStatus, // 'yes' or 'no'
    };

    console.log("Amount before modal opens:", this.paymentData.amount); // Log the amount
    console.log("Payment Data:", this.paymentData); // Optional: Log the whole object for debugging

    this.conductedModal.open(); // Open the modal
  }

  // Submit payment data
  // submitPayment() {
  //   const { conductedId, amount, received } = this.paymentData;

  //   // Make a call to the backend
  //   this.appointmentService.submitPayment(conductedId, amount, received).subscribe(
  //     (response: any) => {
  //       console.log('Payment submitted:', response);
  //       this.conductedModal.close(); // Close the modal on success
  //     },
  //     (error: any) => {  // Explicitly set type to 'any' or 'unknown'
  //       console.error('Error submitting payment:', error);
  //     }
  //   );
  // }

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

  // Columns for different tables
  datatable1Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "company", title: "Consultant" },
    { field: "age", title: "Health Issues" },
    { field: "dob", title: "Slot Time" },
    { field: "phone", title: "Phone No." },
    { field: "fee", title: "Fee" },
    { field: "paymentstatus", title: "Payment Status" }, // Payment status column
    {
      field: "action",
      title: "Action",
      sort: false,
      headerClass: "justify-center",
    },
  ];

  datatable2Cols = [
    { field: "serial", title: "Sr. No" },
    { field: "slots_time", title: "Slot Time" },
    // { field: "branch_id", title: "Branch ID" }
  ];

  datatable3Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "company", title: "Consultant" },
    { field: "age", title: "Health Issues" },
    { field: "dob", title: "Slot Time" },
    { field: "phone", title: "Phone No." },
    { field: "paymentstatus", title: "Payment Status" }, // Payment status column
  ];

  datatable4Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "company", title: "Consultant" },
    { field: "age", title: "Health Issues" },
    { field: "dob", title: "Slot Time" },
    { field: "phone", title: "Phone No." },
    { field: "paymentstatus", title: "Payment Status" }, // Payment status column
  ];

  datatable5Cols = [
    { field: "id", title: "Sr.No" },
    { field: "firstName", title: "Name" },
    { field: "age", title: "Health Issues" },
    { field: "company", title: "Company" },
    { field: "dob", title: "Start Date" },
    { field: "email", title: "Email" },
    { field: "phone", title: "Phone No." },
    { field: "paymentstatus", title: "Payment Status" }, // Payment status column
  ];

  // Rows Data
  rows = [
    {
      id: 1,
      firstName: "Kiran",
      lastName: "J",
      email: "carolinejensen@zidant.com",
      dob: "2:00 Pm",
      phone: "+1 (821) 447-3782",
      isActive: true,
      age: "Back Pain",
      company: "Raj",
      fee: "500",
      paymentstatus: "Yes", // Payment status "Yes"
    },
    {
      id: 2,
      firstName: "Pooja",
      lastName: "Sharma",
      email: "celestegrant@polarax.com",
      dob: "3:00 Pm",
      phone: "+1 (838) 515-3408",
      isActive: false,
      age: "Neck Pain",
      company: "Priya",
      fee: "500",
      paymentstatus: "No", // Payment status "No"
    },
    {
      id: 3,
      firstName: "Amit",
      lastName: "S",
      email: "tillmanforbes@manglo.com",
      dob: "4:00 Pm",
      phone: "+1 (969) 496-2892",
      isActive: false,
      age: "Head Pain",
      company: "Riya",
      fee: "500",
      paymentstatus: "Yes", // Payment status "Yes"
    },
    {
      id: 4,
      firstName: "Lalit",
      lastName: "L",
      email: "daisywhitley@applideck.com",
      dob: "5:00 Pm",
      phone: "+1 (861) 564-2877",
      isActive: true,
      age: "Head Pain",
      company: "Raj",
      fee: "500",
      paymentstatus: "No", // Payment status "No"
    },
    {
      id: 5,
      firstName: "Kajol",
      lastName: "D",
      email: "weberbowman@volax.com",
      dob: "6:00 Pm",
      phone: "+1 (962) 466-3483",
      isActive: false,
      age: "Head Pain",
      company: "Priya",
      fee: "500",
      paymentstatus: "Yes", // Payment status "Yes"
    },
  ];

  // Component Initialization
  ngOnInit() {
    this.fetchTodaysAppointments();
    this.fetchConductedAppointments();
    this.fetchUpcomingAppointments();
    this.fetchCancelledAppointments();
    this.fetchPendingAppointments();
    this.fetchConsultants();
    this.fetchBranches();
    this.rows = this.rows.map((row) => {
      return {
        ...row,
      };
    });
  }

  // loadData() {
  //   // Assuming you already fetched the data, populate filteredRows
  //   this.filteredRows = [
  //     {
  //       slots_time: '9:00 AM',
  //       branch_id: 1,
  //       day_name: 'Monday',
  //       created_at: '2024-11-07 04:38:53.710',
  //       doctor_id: 1
  //     },
  //     // Add more data items...
  //   ];
  // }

  // Method to call when the "Today's" tab is clicked
  onClickTodayTab() {
    this.fetchTodaysAppointments();
  }

  // Method to call when the "Upcoming" tab is clicked
  onClickUpcomingTab() {
    this.fetchUpcomingAppointments();
  }

  // Method to call when the "Cancelled" tab is clicked
  onClickCancelledTab() {
    this.fetchCancelledAppointments();
  }

  // Method to call when the "Conducted" tab is clicked
  onClickConductedTab() {
    this.fetchConductedAppointments();
  }

  fetchTodaysAppointments() {
    this.isLoading = true;
    const endpoint = `get_todays_appointment_data/tbl_appointment`;
    this.apiService.get(endpoint).subscribe(
    // this.http.get( "http://localhost/OPDClinic/get_todays_appointment_data/tbl_appointment").subscribe(
        (response: any) => {
          console.log("Fetch Response:", response); // Log the full response to check the structure

          if (response.status === 200) {
            console.log("Data received:", response.data); // Log the data to verify if it's being fetched correctly
            this.conductedList = response.data; // Assign data to conductedList
            this.searchconducteds(); // Update filtered list
          } else {
            console.error("Error status in response:", response.message); // Log error message from the response
            this.showMessage(response.message, "error");
          }
        },
        (error) => {
          this.showMessage("Yoy Dont Have Appointment Today.", "info");
        }
      )
      .add(() => {
        this.isLoading = false;
      });
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

  onConsultantChange(event: any) {
    this.selectedConsultantId = +event.target.value;
  }

  onBranchChange(event: any) {
    this.selectedBranchId = +event.target.value;
  }
  fetchSlots() {
    if (!this.selectedConsultantId || !this.selectedBranchId) {
      this.showMessage(
        "Please select both a consultant and a branch.",
        "error"
      );
      return;
    }

    this.filteredRows = [];
    this.isLoading = true;

    // const apiUrl = `http://localhost/OPDClinic/getslots/tbl_slots`;
    const endpoint = 'getslots/tbl_slots';
    const apiUrl = `${this.apiService.getBaseUrl()}/${endpoint}`;

    const body = {
      consultantId: this.selectedConsultantId,
      branchId: this.selectedBranchId,
    };

    this.http
      .post<ApiResponse<any>>(apiUrl, body, {
        headers: { "Content-Type": "application/json" },
      })
      .subscribe(
        (response) => {
          if (response.status === 200) {
            console.log("Fetched slots:", response.data); // Log the data for verification
            this.processSlots(response.data);

            // Map the response data and add serial number
            this.filteredRows = response.data.map(
              (item: Slot, index: number) => ({
                ...item,
                serial: index + 1, // This will assign a serial number based on the index
              })
            );
            console.log(
              "Filtered rows with serial numbers:",
              this.filteredRows
            ); // Log to verify
          } else if (response.status === 404) {
            // Handle no data case
            this.showMessage("No data available", "info");
          }
        },
        (error) => {
          if (error.status === 404) {
            // Show "No data available" message instead of an error
            this.showMessage("No data available", "info");
          } else {
            // For other errors, show the error message
            this.showMessage("Error fetching slots: " + error.message, "error");
          }
        }
      )
      .add(() => {
        // Set loading state to false after response or error
        this.isLoading = false;
      });
  }

  fetchConsultants() {
    const role = "Consultant"; // Define the role you want to filter by
    // this.http.get<any>(`http://localhost/OPDClinic/get_where_condition_data/tbl_register/${role}`).subscribe(
      const endpoint = `get_where_condition_data/tbl_register/${role}`;
      this.apiService.get(endpoint).subscribe(
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

  processSlots(slots: any[]) {
    this.slotsByDay = {};
    slots.forEach((slot) => {
      const day = slot.day_name.toLowerCase();
      if (!this.slotsByDay[day]) {
        this.slotsByDay[day] = [];
      }
      this.slotsByDay[day].push(slot);
    });
  }

  fetchConductedAppointments() {
    this.isLoading = true;
    this.apiService.get("get_conducted_appointments").subscribe(
    // this.http.get("http://localhost/OPDClinic/get_conducted_appointments").subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.conductedAppointments = response.data; // Store conducted appointments data
          } else {
            console.error("Error:", response.message);
            this.showMessage(response.message, "error");
          }
        },
        (error) => {
          console.error("Error fetching conducted appointments:", error);
          this.showMessage("Error fetching conducted appointments.", "error");
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }

  // Directly submitting payment data
  submitPayment() {
    // const { conductedId, amount, received } = this.paymentData;
    const paymentStatus = this.paymentData.received === "yes" ? "P" : "U";
    const transformedData = {
      id: this.paymentData.conductedId, // `conductedId` mapped to `id`
      price: this.paymentData.amount, // `amount` mapped to `price`
      payment_status: paymentStatus, // `received` mapped to `payment_status`
      appointment_status: "CD",
    };
    this.apiService.post("submitPayment", transformedData).subscribe(
    // this.http.post("http://localhost/OPDClinic/submitPayment", transformedData).subscribe(
        (response: any) => {
          console.log("Payment submitted:", response);
          this.fetchTodaysAppointments();
          this.fetchPendingAppointments();
          this.conductedModal.close(); // Close the modal on success
        },
        (error: any) => {
          console.error("Error submitting payment:", error);
        }
      );
  }

  fetchPendingAppointments() {
    this.isLoading = true;

    // this.http.get("http://localhost/OPDClinic/get_pending_appointments").subscribe(
      this.apiService.get("get_pending_appointments").subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.pendingStatusAppointments = response.data; // Store upcoming appointments data
          } else {
            console.error("Error:", response.message);
            this.showMessage(response.message, "error");
          }
        },
        (error) => {
          console.error("Error fetching pending appointments:", error);
          this.showMessage("Error fetching pending appointments.", "error");
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }

  fetchCancelledAppointments() {
    this.isLoading = true;
    this.apiService.get("get_cancelled_appointments").subscribe(

    // this.http.get("http://localhost/OPDClinic/get_cancelled_appointments").subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.cancelledAppointments = response.data; // Store upcoming appointments data
          } else {
            console.error("Error:", response.message);
            this.showMessage(response.message, "error");
          }
        },
        (error) => {
          console.error("Error fetching cancelled appointments:", error);
          this.showMessage("Error fetching cancelled appointments.", "error");
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }

  fetchUpcomingAppointments() {
    this.isLoading = true;
    this.apiService.get("get_upcoming_appointments").subscribe(
    // this.http.get("http://localhost/OPDClinic/get_upcoming_appointments").subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.upcomingAppointments = response.data; // Store upcoming appointments data
          } else {
            console.error("Error:", response.message);
            this.showMessage(response.message, "error");
          }
        },
        (error) => {
          console.error("Error fetching upcoming appointments:", error);
          this.showMessage("Error fetching upcoming appointments.", "error");
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }

  public fetchAppointments(tab: string) {
    // Determine the appointment status and date conditions based on the tab
    let appointmentStatus = ""; // Default status
    const filters: any = {
      consultantId: this.selectedConsultantId,
      branchId: this.selectedBranchId,
      tab: tab,
    };

    // Apply filters based on the selected tab
    switch (tab) {
      case "home":
        appointmentStatus = "PE";
        filters.date = new Date().toISOString().split("T")[0]; // Today's date (yyyy-mm-dd)
        break;
      case "upcoming":
        appointmentStatus = "PE";
        filters.date = new Date().toISOString().split("T")[0]; // Dates from today onwards
        break;
      case "conducted":
        appointmentStatus = "CD";
        break;
      case "cancelled":
        appointmentStatus = "CN";
        break;
      case "pending":
        appointmentStatus = "PE";
        break;

      default:
        console.error("Unknown tab selected");
        return;
    }

    // Add appointment status to filters
    filters.appointment_status = appointmentStatus;
    this.isLoading = true;

    // this.http.post("http://localhost/OPDClinic/get_filtered_appointments/tbl_appointment",filters).subscribe(
      this.apiService.post("get_filtered_appointments/tbl_appointment", filters).subscribe(

      (response: any) => {
          console.log("Fetch Response:", response); // Log the response for debugging

          if (response.status === 200) {
            // Populate the correct array based on the tab
            switch (tab) {
              case "home":
                this.conductedList = response.data || [];
                break;
              case "upcoming":
                this.upcomingAppointments = response.data || [];
                break;
              case "conducted":
                this.conductedAppointments = response.data || [];
                break;
              case "cancelled":
                this.cancelledAppointments = response.data || [];
                break;

              case "pending":
                this.pendingStatusAppointments = response.data || [];
                break;
            }

            // Set `noDataAvailable` flag if the data array is empty
            this.noDataAvailable = response.data.length === 0;
          } else {
            console.error("Error status in response:", response.message);
            this.noDataAvailable = true;
            this.clearAppointmentData(); // Clear appointment data arrays on error
          }
        },
        (error) => {
          // console.error("Error fetching slots:", error);

          // Check if data is not available
          if (
            !error ||
            error.data === null ||
            error.data === undefined ||
            error.data.length === 0
          ) {
            this.showMessage("No data available", "info");
            this.clearAppointmentData(); // Clear appointment data arrays on error
          }
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }

  // Helper method to clear all appointment arrays
  private clearAppointmentData() {
    this.conductedAppointments = [];
    this.upcomingAppointments = [];
    this.cancelledAppointments = [];
    this.conductedList = [];
    this.pendingStatusAppointments = [];
  }

  searchconducteds() {
    this.filterdconductedsList = this.conductedList.filter((d) =>
      d.branch_name.toLowerCase().includes(this.searchUser.toLowerCase())
    );
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

  // Tabs Setup
  tab1: string = "home";
  tab2: string = "home";
  tab3: string = "home";
  tab4: string = "home";
  tab5: string = "home";
  tab6: string = "home";
  tab7: string = "home";
  tab8: string = "home";
  tab9: string = "home";
  tab10: string = "home";
  tab11: string = "home";
  tab12: string = "home";
  tab13: string = "home";
  tab14: string = "home";
  tab15: string = "home";
  tab16: string = "home";
  tab17: string = "home";
  tab18: string = "home";
  tab19: string = "home";
  tab20: string = "home";
  tab21: string = "home";
  tab22: string = "home";

  // Store Variables for Dynamic Changes
  store: any;
  bitcoin: any;
  ethereum: any;
  litecoin: any;
  binance: any;
  tether: any;
  solana: any;
  isLoading = true;

  // Constructor

  constructor(
    private http: HttpClient,
    public storeData: Store<any>,
    private apiService: ApiService,
    // private appointmentService: AppointmentService
    private cdr: ChangeDetectorRef
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

  canceledshedule(formData: any) {
    const requestBody = {};

    // this.http.post(`http://localhost/OPDClinic/canceledshedule/tbl_appointment/${formData.id}`,requestBody).subscribe(
      this.apiService.post(`canceledshedule/tbl_appointment/${formData.id}`, requestBody).subscribe(
      (response) => {
          console.log("Cancel response:", response);
          this.conductedList = this.conductedList.filter(
            (d) => d.id !== formData.id
          );
          this.fetchBranches();

          this.showMessage("Schedule has been canceled successfully.");
        },
        (error) => {
          console.error("Error canceling schedule:", error);
          this.showMessage("Error canceling schedule.", "error");
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

  resetFilters() {
    this.fetchConductedAppointments();
    this.fetchCancelledAppointments();
    this.fetchUpcomingAppointments();
    this.fetchTodaysAppointments();
    this.fetchPendingAppointments();

    // Clear dropdown values
    const consultantDropdown = document.getElementById(
      "consultant"
    ) as HTMLSelectElement;
    const branchDropdown = document.getElementById(
      "branch"
    ) as HTMLSelectElement;

    if (consultantDropdown) consultantDropdown.value = "";
    if (branchDropdown) branchDropdown.value = "";

    // Clear any selected filters or data
    this.selectedBranchId = null;
    this.selectedConsultantId = null;
    this.filteredAppointments = []; // Clear search results
    this.filteredRows = []; // Clear search results

    this.showMessage("Filters have been reset", "info");
  }
}
