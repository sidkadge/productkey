import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Swal from "sweetalert2";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function rejectSpecificNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Check if the value is exactly "0000000000"
    if (value === "0000000000") {
      return { specificNumberRejected: true };
    }

    return null; // Valid number
  };
}

@Component({
  selector: "app-appointment-form",
  templateUrl: "./appointment-form.html",
  styleUrls: ["./appointform-form.css"],
})
export class AppointmentFormComponent {
  fetchedSlots: any[] = []; // Declare fetchedSlots as an array

  appointmentForm: FormGroup;
  // availableSlots: string[] = [];
  selectedSlot: string | null = null; // To hold the selected slot
  branches: any[] = []; // Property to hold the branches
  consultants: any[] = []; // Property to hold the consultants
  sectionsList: any[] = []; // Initialize sectionsList to hold section data
  availableSlots: any[] = [];
  // Flags and active tab management
  showSubscription: boolean = false; // Flag to show/hide subscription options
  activeTab5 = 1; // Used for managing the active tab for weekdays
  isLoading: boolean = false;

  previousSection: string | null = null;

  isSlotSelected: boolean = false;
  daysArray: number[] = [];
  minDate!: string;
  maxDate!: string;
  restrictedStartDate!: string; // New variable name

  // Array for weekdays to generate dynamic tabs
  weekDays: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  // minDate: string;

  // Static data for each day's slots

  summaryData: any = {}; // Declare the summaryData property

  // Initialize staticSlotData with empty arrays for each day
  staticSlotData: { [key: string]: { time: string; id: string }[] } = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Initialize form group with controls
    this.appointmentForm = this.fb.group({
      branch: ["", Validators.required],
      hawservices: ["", Validators.required],
      consultant: ["", Validators.required],
      healthissues: [""], // Optional field
      date: ["", Validators.required],
      full_name: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z ]+$"), // Only letters and spaces
        ],
      ],
      age: [
        "",
        [Validators.required, Validators.pattern("^[0-9]*$")], // Only numeric values
      ],
      mobile_no: [
        "",
        [
          Validators.required,
          Validators.pattern("^[1-9][0-9]{9}$"), // Basic 10-digit validation
          rejectSpecificNumber(), // Custom validator for rejecting "0000000000"
        ],
      ],
      email_id: [
        "",
        [Validators.email], // Valid email format
      ],
      location: [
        "",
      ],
      slot: ["", Validators.required], // Ensure a slot is selected
      subscription: [""], // Optional subscription field
      plan: ["custom"], // Default to 'custom'; valid values are 'daily' or 'custom'
      subscriptionType: [""], // Subscription type is optional
      startDate: [""], // Start date for subscription
      section: ["", Validators.required], // Mandatory field
    });

    const today = new Date();
    this.minDate = today.toISOString().split("T")[0];
  }

  // Utility to get form control
  get f() {
    return this.appointmentForm.controls;
  }

  ngOnInit() {
    this.fetchBranches(); // Fetch branches on initialization
    this.fetchConsultants(); // Fetch consultants on initialization
    this.fetchSections(); // Fetch sections on initialization
    // Populate daysArray dynamically
    this.daysArray = Array.from({ length: 29 }, (_, i) => i + 2); // [2, 3, ..., 30]

    this.appointmentForm.get("slot")?.valueChanges.subscribe((slotId) => {
      this.onSlotSelected(slotId);
    });
    this.appointmentForm.get("section")?.valueChanges.subscribe((value) => {
      console.log("Section value:", value); // Debug to see if/when it changes
    });
    setTimeout(() => {
      this.appointmentForm.get("section")?.setValue("test_value");
    }, 1000);
    this.setDateLimits();

    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    this.restrictedStartDate = tomorrow.toISOString().split("T")[0];
  }

  onSlotSelected(slotId: string | null): void {
    this.isSlotSelected = !!slotId; // Update based on whether a slot is selected
  }

  // ngOnChanges(): void {
  //   if (this.activeTab5 === 3) {
  //     console.log('Summary Data:', this.summaryData);
  //   }
  // }

  isSectionValid(): boolean {
    if (this.activeTab5 === 1) {
      // Validate Slot Selection (1st Section)
      return this.isSlotSelected;
    } else if (this.activeTab5 === 2) {
      // Validate Patient Tab (2nd Section)
      return this.isPatientTabValid();
    }
    // Additional sections can be handled here if needed
    return false;
  }

  isPatientTabValid(): boolean {
    const patientControls = [
      "full_name",
      "age",
      "mobile_no",
      // "email_id",
      // "location",
    ];
    return patientControls.every((control) => {
      const formControl = this.appointmentForm.get(control);
      return formControl && formControl.valid && formControl.touched;
    });
  }

  // setDateLimits() {
  //   const today = new Date();
  //   this.minDate = today.toISOString().split('T')[0]; // e.g., '2024-11-18'

  //   const maxDate = new Date();
  //   maxDate.setDate(today.getDate() + 30);
  //   this.maxDate = maxDate.toISOString().split('T')[0]; // e.g., '2024-12-18'

  //   console.log("Min Date:", this.minDate); // Debug
  //   console.log("Max Date:", this.maxDate); // Debug
  // }

  setDateLimits() {
    const today = new Date();
    this.minDate = today.toISOString().split("T")[0]; // e.g., '2024-11-18'

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    this.maxDate = maxDate.toISOString().split("T")[0]; // e.g., '2024-12-18'

    console.log("Min Date:", this.minDate); // Debug
    console.log("Max Date:", this.maxDate); // Debug
  }

  fetchBranches() {
    this.http
      .get<any>("http://localhost/OPDClinic/read/tbl_branch")
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.branches = response.data; // Assign the fetched branches
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
    this.http
      .get<any>(
        `http://localhost/OPDClinic/get_where_condition_data/tbl_register/${role}`
      )
      .subscribe(
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

  fetchSections() {
    this.http.get("http://localhost/OPDClinic/read/tbl_section").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.sectionsList = response.data; // Store sections in sectionsList

          // Set the default section value to the first section (if available)
          // if (this.sectionsList.length > 0) {
          //   // this.appointmentForm.patchValue({
          //   //   section: this.sectionsList[0].id,
          //   // }); // Corrected this line
          // }
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching sections:", error);
        this.showMessage("Error fetching sections.", "error");
      }
    );
  }
  onSelectionChange() {
    // Get the current values from the form
    const branch = this.appointmentForm.get("branch")?.value;
    const consultant = this.appointmentForm.get("consultant")?.value;
    const date =
      this.appointmentForm.get("date")?.value ||
      this.appointmentForm.get("startDate")?.value;
    const hawservices = this.appointmentForm.get("section")?.value;
    const dailys = this.appointmentForm.get("daily")?.value;

    // Check if the selected section has changed compared to the previous selection
    if (hawservices !== this.previousSection) {
      // If it's the first time selecting or the section has changed, reset relevant fields
      this.appointmentForm.patchValue({
        date: null,
        startDate: null,
        daily: null,
        subscriptionType: null,
        consultant: null,
        healthissues: null,
      });

      // Update the previous section to the current one for future checks
      this.previousSection = hawservices;
    }

    // Find the selected branch, consultant, and service details
    const selectedBranch = this.branches.find((b) => b.id === branch);
    const branchName = selectedBranch ? selectedBranch.branch_name : null;

    const selectedConsultant = this.consultants.find(
      (c) => c.id === consultant
    );
    const consultantName = selectedConsultant ? selectedConsultant.name : null;

    // Use `sectionsList` to find the selected service information
    const selectedHawservice = this.sectionsList.find(
      (s) => s.id === hawservices
    );
    const awservices = selectedHawservice
      ? selectedHawservice.section_name
      : null;

    // Update summary data
    this.summaryData = {
      branch,
      branchName,
      consultant,
      consultantName,
      date,
      hawservices,
      awservices,
    };

    // Set visibility for subscription-related information
    this.showSubscription = hawservices === "6";

    // Fetch available slots only if all required fields have valid values
    if (branch && consultant && date) {
      this.fetchAvailableSlots();
    }

    // Check conditions for fetching subscription or daily appointment slots
    if (dailys === "daily" || hawservices === "6") {
      this.fetchSubscriptionAppointment(branch, date, hawservices);
    }
    if (dailys === "custom" || hawservices === "6") {
      this.fetchDayWiseSlots(branch, dailys, hawservices, date);
    }
  }

  // staticSlotData: { [key: string]: { time: string; id: string }[] } = {}; // Initialize as an empty object

  fetchDayWiseSlots(
    branch: string,
    dailys: string,
    section: string,
    date: string
  ) {
    // Prepare the payload
    const payload = {
      branch_id: this.summaryData.branch,
      selected_date: date, // Include the date in the payload
      section: section, // Include section if needed
    };

    // Check if all necessary values are not null
    if (!payload.branch_id || !payload.selected_date || !payload.section) {
      console.warn(
        "Required fields are missing, API call will not be made:",
        payload
      );
      return; // Exit the function if any value is null
    }
    this.isLoading = true;
    // console.log("Payload being sent to fetch slots:", payload);

    // Proceed with the API call if all required fields are present
    this.http
      .post<any>(
        "http://localhost/OPDClinic/fetchslotsforcustome",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .subscribe(
        (response) => {
          // console.log("Response from server:", response);
          this.isLoading = false;
          if (response.status === 200) {
            this.fetchedSlots = response.data;
            console.log("Fetched slots successfully:", this.fetchedSlots);

            // Transform the fetched slots to match staticSlotData format
            this.staticSlotData = this.transformSlotsToStaticFormat(
              this.fetchedSlots
            );
            console.log("Formatted static slot data:", this.staticSlotData);

            // Log each day's slots
            for (const day in this.staticSlotData) {
              console.log(
                `Available slots for ${day}:`,
                this.staticSlotData[day]
              );
            }
          } else {
            console.error("Error fetching slots:", response.message);
          }
        },
        (error) => {
          this.isLoading = false;
          console.error("Error fetching slots:", error);
        }
      );
  }

  transformSlotsToStaticFormat(fetchedSlots: any[]): {
    [key: string]: { time: string; id: string }[];
  } {
    const groupedSlots: { [key: string]: { time: string; id: string }[] } = {};

    fetchedSlots.forEach((slot) => {
      const day = slot.day_name; // Ensure day_name exists in the fetched data
      const time = slot.slots_time; // Ensure slots_time exists in the fetched data
      const slot_id = slot.id; // Ensure id exists in the fetched data

      // Initialize array for the day if it doesn't exist
      if (!groupedSlots[day]) {
        groupedSlots[day] = [];
      }

      // Add time and id object to the day’s array
      groupedSlots[day].push({ time, id: slot_id });
    });

    return groupedSlots;
  }

  fetchSubscriptionAppointment(branch: string, date: string, section: string) {
    const payload = {
      branch_id: branch,
      appointment_date: date,
      section_id: section,
    };

    // Log the payload to the console for debugging
    console.log(
      "Payload being sent to fetch subscription appointment:",
      payload
    );

    this.http
      .post<any>(
        "http://localhost/OPDClinic/subscribtionappointment",
        payload
      )
      .subscribe(
        (response) => {
          console.log("Response from server:", response);

          // Check if the response status is 200
          if (response.status === 200) {
            this.availableSlots = response.data; // Assuming response.data contains the available slots
          } else {
            console.error("Error fetching slots:", response.message);
          }
        },
        (error) => {
          console.error("Error sending subscription appointment data:", error);
        }
      );
  }

  fetchAvailableSlots() {
    const payload = {
      doctor_id: this.summaryData.consultant,
      selected_date: this.summaryData.date,
      branch_id: this.summaryData.branch,
    };

    // Clear any previous slot data to prevent showing outdated information
    this.availableSlots = [];
    this.isLoading = true;

    this.http
      .post<any>("http://localhost/OPDClinic/fetchslots", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .subscribe(
        (response) => {
          console.log("Response from server:", response);

          if (response.status === 200) {
            this.availableSlots = response.data; // Assign available slots
            // console.log("Available slots fetched successfully:", this.availableSlots);

            // Show success message if slots are available
            if (this.availableSlots.length > 0) {
              // this.showMessage("Slots available! Please select a convenient time to book your appointment.!", "success");
            } else {
              this.showMessage("No slots available for this day.", "info");
            }
          } else {
            console.error("Error fetching slots:", response.message);
            this.showMessage(
              "No slots available on this date as it is a holiday.",
              "info"
            );
          }
        },
        (error) => {
          console.error("Error fetching slots:", error);
          this.showMessage(
            "Error fetching slots. Please try again later.",
            "error"
          );
        }
      )
      .add(() => {
        // Set loading state to false after response or error
        this.isLoading = false;
      });
  }

  submitForm(): void {
    this.isLoading = true; // Set loading to true when starting the request

    const formData = {
      ...this.appointmentForm.getRawValue(),
      slots: { ...this.selectedSlotsForDays },
    };
    console.log(formData);
    // Check the condition for subscriptionType and plan
    if (formData.startDate != null) {
      // If conditions are met, call the submitappointments function
      this.submitappointments(formData);
    } else {
      // Otherwise, submit the form data as usual

      this.http
        .post("http://localhost/OPDClinic/submitappointment", formData)
        .subscribe(
          (response) => {
            console.log("Form submitted successfully:", response);
            this.showMessage("Appointment booked successfully!", "success");
            this.activeTab5 = 1; // Navigate back to the first tab
            this.appointmentForm.reset(); // Optionally reset the form for a new entry
            this.selectedSlotsForDays = {}; // Clear selected slots
          },
          (error) => {
            console.error("Error submitting form:", error);
            this.showMessage(
              "Failed to book the appointment. Try again.",
              "error"
            );
          }
        )
        .add(() => {
          // Set loading state to false after response or error
          this.isLoading = false;
        });
    }
  }

  // Function to handle the custom submission logic when 'Exersize' subscription and 'custom' plan
  submitappointments(formData: any): void {
    // Call your backend API for the custom submission
    this.isLoading = true; // Set loading to true when starting the request

    this.http
      .post("http://localhost/OPDClinic/submitappointments", formData)
      .subscribe(
        (response) => {
          console.log("Custom appointment booked successfully:", response);
          this.showMessage(
            "Custom appointment booked successfully!",
            "success"
          );
          this.activeTab5 = 1; // Navigate back to the first tab
          this.appointmentForm.reset(); // Optionally reset the form for a new entry
          this.selectedSlotsForDays = {}; // Clear selected slots
        },
        (error) => {
          console.error("Error submitting custom appointment:", error);
          this.showMessage(
            "Failed to book the custom appointment. Try again.",
            "error"
          );
        }
      )
      .add(() => {
        // Set loading state to false after response or error
        this.isLoading = false;
      });
  }

  // Method to handle slot selection
  selectedSlotsForDays: { [key: string]: { time: string; id: string } } = {};

  onSlotSelect(time: string, id: string, day: string) {
    // Save both time and id for the specific day
    this.selectedSlotsForDays[day] = { time, id };

    // Set the slot time in the form for any further use
    this.appointmentForm.get("slot")?.setValue(time);

    // Update summaryData to include the selected slot information
    this.summaryData = {
      ...this.appointmentForm.value,
      branchName: this.summaryData.branchName,
      slots: { ...this.selectedSlotsForDays },
    };

    // console.log(`Selected Slot for ${day}: Time - ${time}, ID - ${id}`); // Debug
  }

  moveToNextTab(): void {
    // Prepare summary data including selected slots for each day
    this.summaryData = {
      ...this.appointmentForm.value,
      branchName: this.summaryData.branchName,
      slots: { ...this.selectedSlotsForDays }, // Include selected slots for each day
    };
    this.activeTab5++; // Move to the next tab
  }

  moveToPreviousTab(): void {
    this.activeTab5--; // Move to the previous tab
  }

  isAnySlotSelected(): boolean {
    // Check if there are any selected slots for the weekDays
    return this.weekDays.some((day) => !!this.selectedSlotsForDays[day]);
  }

  // Method to handle subscription changes
  onSubscribeChange(isSubscribed: boolean) {
    this.showSubscription = true;

    if (!isSubscribed) {
      // Reset the plan and start date selection when subscription is 'No'
      this.appointmentForm.get("plan")?.setValue("");
      this.appointmentForm.get("startDate")?.setValue("");
    }
  }
  onButtonClick(): void {
    if (this.activeTab5 < 3) {
      this.moveToNextTab();
    } else {
      this.submitForm(); // Call the submit method on the last tab
    }
  }

  codeArr: any = [];
  toggleCode = (name: string) => {
    if (this.codeArr.includes(name)) {
      this.codeArr = this.codeArr.filter((d: string) => d !== name);
    } else {
      this.codeArr.push(name);
    }
  };

  // Additional active tab management variables
  activeTab1 = 1;
  activeTab2 = 1;
  activeTab3 = 1;
  activeTab4 = 1;
  activeTab6 = 1;
  activeTab7 = 1;

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
