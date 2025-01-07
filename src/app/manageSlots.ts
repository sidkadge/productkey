import { Component, ViewChild, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Swal from "sweetalert2";
import { ApiService } from 'src/app/api.service';
import { Router, NavigationEnd } from "@angular/router";

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Component({
  templateUrl: "./manageSlots.html",
})
export class manageSlotsComponent implements OnInit {
  consultants: any[] = [];
  branches: any[] = [];
  slotsByDay: any = {};
  tab2: string = "monday";
  user: any = null; // Variable to store user data

  // tab2: string = 'monday'; // Default active tab
  daysOfWeek: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  selectedConsultantId: number | null = null;
  selectedBranchId: number | null = null;
  selectedSlotId: number | null = null;
  @ViewChild("editSlotModal") editSlotModal!: NgxCustomModalComponent;
  editSlotForm!: FormGroup;
  isLoading: boolean = false;
  showDateInput: boolean = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    public router: Router


  ) {
    this.editSlotForm = this.fb.group({
      date: ["", Validators.required],
      action: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.fetchConsultants();
    this.fetchBranches();

    this.editSlotForm.get("action")?.valueChanges.subscribe((actionValue) => {
      if (actionValue === "book") {
        this.showDateInput = true;
        this.editSlotForm.get("date")?.setValidators(Validators.required);
      } else {
        this.showDateInput = false;
        this.editSlotForm.get("date")?.clearValidators();
      }
      this.editSlotForm.get("date")?.updateValueAndValidity();
    });

    this.setActiveDropdown();
    console.log("Userdata: " + localStorage.getItem("userData"));
        // Retrieve user data from localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          this.user = JSON.parse(storedUserData);
    
          // Parse the `access_levels` property from JSON string to an array
          try {
            this.user.access_levels = this.user.access_levels;
          } catch (error) {
            console.error("Failed to parse access_levels:", error);
            this.user.access_levels = [];
          }
        }

        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            this.setActiveDropdown();
          }
        });
  }

  hasAccess(level: string): boolean {
    // Checks if the user has the required access level
    return this.user?.access_levels?.includes(level);
  }

  setActiveDropdown(): void {
    // Timeout ensures DOM is ready before querying
    setTimeout(() => {
      const selector = document.querySelector(
        '.sidebar ul a[routerLink="' + window.location.pathname + '"]'
      );
      if (selector) {
        selector.classList.add("active");

        const ul: any = selector.closest("ul.sub-menu");
        if (ul) {
          const navLink: any = ul
            .closest("li.menu")
            ?.querySelector(".nav-link");
          if (navLink) {
            setTimeout(() => {
              navLink.click();
            });
          }
        }
      } else {
        console.warn("Active sidebar item not found!");
      }
    }, 0);
  }
  onDayTabClick(day: string): void {
    if (this.isDataAvailable(day)) {
      console.log(`Tab clicked: ${day}`);
      // Add logic to handle slot display or data fetching for the selected day
    }
    // Add logic to fetch or display slots for the selected day
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

  onConsultantChange(event: any) {
    if (this.user.role === 'Consultant') {
      // Directly assign the user's ID if the role is Consultant
      this.selectedConsultantId = this.user.id;
      
    } else {
      // Otherwise, get the selected consultant ID from the dropdown
      this.selectedConsultantId = +event.target.value;
    }
  }

  onBranchChange(event: any) {
    this.selectedBranchId = +event.target.value;
  }

  // fetchSlots() {
  //   if (!this.selectedConsultantId || !this.selectedBranchId) {
  //     this.showMessage(
  //       "Please select both a consultant and a branch.",
  //       "error"
  //     );
  //     return;
  //   }

  //   // Clear previous slots
  //   this.slotsByDay = {};
  //   this.isLoading = true; // Show loader while fetching slots

  //   const apiUrl = `http://localhost/OPDClinic/getslots/tbl_slots`;
  //   const body = {
  //     consultantId: this.selectedConsultantId,
  //     branchId: this.selectedBranchId,
  //   };

  //   this.http.post<ApiResponse<any>>(apiUrl, body, {headers: { "Content-Type": "application/json" },}).subscribe(
  //       (response) => {
  //         this.isLoading = false; // Stop loader

  //         if (response.status === 200) {
  //           this.processSlots(response.data);
  //         } else {
  //           this.showMessage("Slots Not Available!", "success");
  //         }
  //       },
  //       (error) => {
  //         this.isLoading = false; // Stop loader
  //         this.showMessage("Slots Not Available!", "success");
  //       }
  //     );
  // }
  fetchSlots() {
    // Check if the role is 'Consultant' and set the selectedConsultantId directly
    if (this.user.role === 'Consultant') {
      this.selectedConsultantId = this.user.id;
    }
  
    // Check if both consultantId and branchId are selected
    if (!this.selectedConsultantId || !this.selectedBranchId) {
      this.showMessage("Please select both a consultant and a branch.", "error");
      return;
    }
  
    // Clear previous slots
    this.slotsByDay = {};
    this.isLoading = true; // Show loader while fetching slots
  
    const body = {
      consultantId: this.selectedConsultantId,
      branchId: this.selectedBranchId,
    };
  
    // Use ApiService for API call
    this.apiService.post(`getslots/tbl_schedule`, body).subscribe(
      (response: ApiResponse<any>) => {
        this.isLoading = false; // Stop loader
  
        if (response.status === 200) {
          this.processSlots(response.data);
        } else {
          this.showMessage("Slots Not Available!", "success");
        }
      },
      (error) => {
        this.isLoading = false; // Stop loader
        console.error("Error fetching slots:", error);
        this.showMessage("Slots Not Available!", "success");
      }
    );
  }
  
  
  processSlots(slots: any[]) {
    this.slotsByDay = {};
  
    slots.forEach((slot) => {
      const day = slot.day_name.toLowerCase();
  
      if (!this.slotsByDay[day]) {
        this.slotsByDay[day] = {};
      }
  
      const timeRange = `${slot.start_time} - ${slot.end_time}`;
  
      if (!this.slotsByDay[day][timeRange]) {
        this.slotsByDay[day][timeRange] = [];
      }
  
      // Add the patients per slot to each slot
      slot.patients_per_slot = slot.patients_per_slot || 0; // assuming it's a field in your response
  
      this.slotsByDay[day][timeRange].push(slot);
    });
  
    this.setFirstAvailableTab();
  }
  
  
  

  setFirstAvailableTab() {
    const availableDays = Object.keys(this.slotsByDay).filter(
      (day) => this.slotsByDay[day] && this.slotsByDay[day].length > 0
    );

    // If there are any available days with slots, set the first one as the active tab
    this.tab2 = availableDays.length > 0 ? availableDays[0] : "monday";
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  

  // setFirstAvailableTab() {
  //   const daysOfWeek = [
  //     "monday",
  //     "tuesday",
  //     "wednesday",
  //     "thursday",
  //     "friday",
  //     "saturday",
  //     "sunday",
  //   ];
  //   this.tab2 =
  //     daysOfWeek.find(
  //       (day) => this.slotsByDay[day] && this.slotsByDay[day].length > 0
  //     ) || "monday";
  // }

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

  deleteConfirmModal(slot: any) {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteSlot(slot.id);
      }
    });
  }

  // deleteSlot(slotId: number) {
  //   const apiUrl = `http://localhost/OPDClinic/delete/tbl_slots/${slotId}`;
  //   this.http.post<any>(apiUrl, {}).subscribe(
  //     (response) => {
  //       if (response.status === 200) {
  //         this.showMessage("Slot deleted successfully.", "success");
  //         this.fetchSlots();
  //       } else {
  //         this.showMessage("Error deleting slot: " + response.message, "error");
  //       }
  //     },
  //     (error) => {
  //       this.showMessage("Error deleting slot: " + error.message, "error");
  //     }
  //   );
  // }
  deleteSlot(slotId: number) {
    if (!slotId) {
      this.showMessage("Invalid Slot ID.", "error");
      return;
    }
  
    // Use ApiService for API call
    this.apiService.post(`delete/tbl_slots/${slotId}`, {}).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.showMessage("Slot deleted successfully.", "success");
          this.fetchSlots(); // Refresh slots after deletion
        } else {
          this.showMessage("Error deleting slot: " + response.message, "error");
        }
      },
      (error) => {
        console.error("Error deleting slot:", error);
        this.showMessage("Error deleting slot: " + error.message, "error");
      }
    );
  }
  
  isDataAvailable(day: string): boolean {
    // Ensure case sensitivity is handled correctly
    return this.slotsByDay[day] && this.slotsByDay[day].length > 0;
  }

  editSlot(slot: any) {
    this.selectedSlotId = slot.slot_id;
    this.editSlotForm.patchValue({
      date: slot.date || "", // Set date if available
      action: slot.status === "B" ? "book" : "",
    });
    this.editSlotModal.open(); // Open modal to edit slot
  }

  saveSlot() {
    if (this.editSlotForm.invalid) {
      this.showMessage("Please fill all required fields.", "error");
      return;
    }
    this.isLoading = true;

    if (!this.selectedConsultantId || !this.selectedBranchId) {
      this.showMessage("Please select a consultant and branch.", "error");
      return;
    }

    const action = this.editSlotForm.value.action;
    let status = "A";
    if (action === "book") {
      status = "B";
    } else if (action === "deactivate") {
      status = "D";
    } else if (action === "active") {
      status = "A";
    }

    const updatedData = {
      id: this.selectedSlotId,
      date: this.editSlotForm.value.date,
      status: status,
      consultantId: this.selectedConsultantId,
      branchId: this.selectedBranchId,
    };
    const endpoint = `slotsmanage`;
    this.apiService.post(endpoint,updatedData).subscribe(
    // this.http.post(`http://localhost/OPDClinic/slotsmanage`, updatedData).subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.isLoading = false;
            this.showMessage("Slot updated successfully", "success");
            this.fetchSlots();
            this.editSlotModal.close(); // Close the modal after saving
          } else {
            this.isLoading = false;
            this.showMessage(
              "Error updating slot: " + response.message,
              "error"
            );
          }
        },
        (error) => {
          this.isLoading = false;
          console.error("Error updating slot:", error);
          this.showMessage("Error updating slot.", "error");
        }
      );
  }
}
