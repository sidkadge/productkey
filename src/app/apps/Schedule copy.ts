import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import Swal from "sweetalert2";
import { MatDialog } from "@angular/material/dialog";

interface Schedule {
  day_name: string;
  start_time: string;
  end_time: string;
  section: string;
  slotcount: string;
  buffer_time: string;
  price: string;

  bufferTime: number;
  eachSlot: number;
  day?: string; // Optional if it exists in the schedule

}


@Component({
  selector: "app-schedule",
  templateUrl: "./schedule.html",
})
export class ScheduleComponent implements OnInit {
  scheduleForm!: FormGroup;
  branches: any[] = []; // Property to hold the branches
  consultants: any[] = []; // Property to hold the consultants
  displayType: string = "list";
  isLoading: boolean = false;

  selectedBranchId: string | null = null;
  selectedConsultantId: string | null = null;
  scheduleData: any[] = [];
  selectedBufferTime: string = '';  // Declare the selected buffer time
  selectedSlotCount: string = '';   // Declare the selected slot count
  selectedPrice: string = '';       // Declare the selected price
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.scheduleForm = this.fb.group({
      schedules: this.fb.array([]),
      bufferTime: [0, Validators.required], // Ensure bufferTime has an initial value
      eachslots: [30, Validators.required],
      branch: ["", Validators.required], // Include branch in the form
      consultant: ["", Validators.required], // Include consultant in the form
      slotcount: [1, Validators.required], // Include slot count
      Price: ["", Validators.required], // Include price
    });

    this.addAllDays(); // Add days of the week on initialization
    this.fetchBranches(); // Fetch branches on initialization
    this.fetchConsultants(); // Fetch consultants on initialization
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

  get schedules() {
    return this.scheduleForm.get("schedules") as FormArray;
  }



  addAllDays() {
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    daysOfWeek.forEach((day) => {
      this.schedules.push(
        this.fb.group({
          day: [day],
          startTime: [""], // No default validators
          endTime: [""], // No default validators
        })
      );
    });
  }

  addNewScheduleBelow(index: number) {
    const currentSchedule = this.schedules.at(index);
    const day = currentSchedule.get("day")?.value;
    const previousEndTime = currentSchedule.get("endTime")?.value;

    if (day) {
      const newSchedule = this.fb.group({
        day: [day, Validators.required],
        startTime: ["", [Validators.required]],
        endTime: ["", [Validators.required]],
      });

      // Save the previous end time as metadata for the new schedule
      // newSchedule
      //   .get("startTime")
      //   ?.setValidators([
      //     Validators.required,
      //     (control) => this.timeValidator(control, previousEndTime),
      //   ]);

      newSchedule.get("startTime")?.setValidators([
        Validators.required,
        (control) => this.timeValidator(control, previousEndTime), // This should work as an array of functions
      ]);
      
        

      this.schedules.insert(index + 1, newSchedule);
    }
  }

  // Validator function for the start time
  timeValidator(control: AbstractControl, previousEndTime: string | null) {
    if (previousEndTime && control.value && control.value <= previousEndTime) {
      return { invalidTime: true };
    }
    return null;
  }
  
  // Validator function for end time
  endTimeValidator(control: AbstractControl, startTime: string | null) {
    if (startTime && control.value && control.value <= startTime) {
      return { invalidEndTime: true };
    }
    return null;
  }

  deleteSchedule(index: number) {
    this.schedules.removeAt(index);
  }

  // Method to handle changes in day slot times
  onDaySlotChange(index: number) {
    const schedule = this.schedules.at(index) as FormGroup;
    const startTime = schedule.get("startTime");
    const endTime = schedule.get("endTime");

    if (startTime?.value || endTime?.value) {
      // Add required validators for active days
      startTime?.setValidators([Validators.required]);
      endTime?.setValidators([Validators.required]);
    } else {
      // Clear validators if the day is not being used
      startTime?.clearValidators();
      endTime?.clearValidators();
    }

    // Update validation status
    startTime?.updateValueAndValidity();
    endTime?.updateValueAndValidity();
  }

  calculateSlots(
    startTime: string,
    endTime: string,
    bufferTime: number,
    slotDuration: number
  ): string[] {
    const slots: string[] = [];
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const buffer = bufferTime * 60000;

    let currentSlotStartTime = start;

    while (currentSlotStartTime < end) {
      const nextSlotEndTime = new Date(
        currentSlotStartTime.getTime() + slotDuration * 60000
      );
      if (nextSlotEndTime <= end) {
        slots.push(
          currentSlotStartTime.toLocaleTimeString([], {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        );
      }
      currentSlotStartTime = new Date(
        currentSlotStartTime.getTime() + slotDuration * 60000 + buffer
      );
    }

    return slots;
  }

  onSubmit() {
    if (this.scheduleForm.invalid) {
      this.schedules.controls.forEach((control, index) => {
        // Skip validation for schedules without startTime and endTime
        const startTime = control.get("startTime")?.value;
        const endTime = control.get("endTime")?.value;

        if (!startTime && !endTime) {
          console.log(`Schedule ${index + 1} is optional and skipped.`);
          return; // Skip validation for unused days
        }

        if (control.invalid) {
          console.log(`Schedule ${index + 1} is invalid`, control.errors);
        }
      });

      this.showMessage(
        "Please fill out all required fields correctly for active days.",
        "error"
      );
      this.scheduleForm.markAllAsTouched(); // Mark touched only for validation purposes
      return;
    }

    // Form is valid; proceed with submission logic
    console.log("Form Submitted Successfully", this.scheduleForm.value);

    this.isLoading = true;
    const requestBody = {
      schedules: this.scheduleForm.value.schedules.map((schedule: any) => {
        const startTime = schedule.startTime;
        const endTime = schedule.endTime;
        const bufferTime = this.scheduleForm.value.bufferTime;
        const eachSlot = this.scheduleForm.value.eachslots;
        const slots = this.calculateSlots(
          startTime,
          endTime,
          bufferTime,
          eachSlot
        );

        return {
          branch: this.scheduleForm.value.branch, // Include branch in the submission
          consultant: this.scheduleForm.value.consultant, // Include consultant ID in the submission
          slotcount: this.scheduleForm.value.slotcount, // Include slot count
          Price: this.scheduleForm.value.Price, // Include price
          bufferTime: this.scheduleForm.value.bufferTime, // Include price

          day: schedule.day,
          startTime: startTime,
          endTime: endTime,
          slots: slots,
        };
      }),
    };

    this.http
      .post("http://localhost/OPDClinic/savescedule/tbl_slots", requestBody)
      .subscribe(
        (response) => {
          console.log("Create response:", response);
          this.showMessage("Schedule has been saved successfully.");
          this.scheduleForm.reset();

          this.isLoading = false;
        },
        (error) => {
          console.error("Error occurred:", error);
          this.showMessage("Error saving schedule.", "error");
          this.isLoading = false;
        }
      )
      .add(() => {
        // Set loading state to false after response or error
        this.isLoading = false;
      });
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

  closeModal() {
    this.dialog.closeAll();
  }


  onBranchChange(event: any) {
    this.selectedBranchId = event.target.value; // Get selected branch ID
    console.log('Branch selected:', this.selectedBranchId);

    // Trigger schedule data fetch if both branch and consultant are selected
    if (this.selectedBranchId && this.selectedConsultantId) {
      this.fetchScheduleData(this.selectedBranchId, this.selectedConsultantId);
    }
  }

  // Method to handle consultant change
  onConsultantChange(event: any) {
    this.selectedConsultantId = event.target.value; // Get selected consultant ID
    console.log('Consultant selected:', this.selectedConsultantId);

    // Trigger schedule data fetch if both branch and consultant are selected
    if (this.selectedBranchId && this.selectedConsultantId) {
      this.fetchScheduleData(this.selectedBranchId, this.selectedConsultantId);
    }
  }

  fetchScheduleData(branchId: string, consultantId: string) {
    this.http
      .get<any>(`http://localhost/OPDClinic/schedule?branchId=${branchId}&consultantId=${consultantId}`)
      .subscribe(
        response => {
          // Check if response and response.data are valid and if the data is an array
          if (response && Array.isArray(response.data) && response.data.length > 0) {
            // If data is valid, sort and then populate the form
            const sortedData = this.sortScheduleData(response.data);
            this.populateScheduleForm(sortedData);
          } else {
            // Handle no data or invalid response scenario
            console.log('No schedule data found or invalid data structure');
          }
        },
        error => {
          // Handle HTTP error
          console.error('Error fetching schedule data:', error);
        }
      );
  }
  populateScheduleForm(scheduleData: Schedule[]) {
    console.log('Populating schedule form with data:', scheduleData);
  
    this.schedules.clear(); // Clear existing form array
  
    const groupedSchedules = this.groupBy(scheduleData, 'day_name');
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
    let allBufferTimesSame = true; // Flag to check if all buffer times are the same across all schedules
    let commonBufferTime: string = ''; // Store the common buffer time if it's the same across all schedules
    let commonSlotCount: string = ''; // Store the common slot count if it's the same
    let commonPrice: string = ''; // Store the common price if it's the same
  
    daysOfWeek.forEach(day => {
      const schedulesForDay = groupedSchedules[day] || [];
  
      // Set to store unique buffer times, slot counts, and prices for the day
      const uniqueBufferTimes = new Set<string>();
      const uniqueSlotCounts = new Set<string>();
      const uniquePrices = new Set<string>();
  
      if (schedulesForDay.length === 0) {
        // If no schedules for the day, add a default form group with empty values
        this.schedules.push(this.fb.group({
          day: [day],
          startTime: [''],
          endTime: [''],
          section: [''],
          slotcount: ['1'],
          eachslots: ['10'],
          bufferTime: ['0'],  // Default buffer time
          Price: [''],
        }));
      } else {
        schedulesForDay.forEach((schedule: Schedule) => {  // Loop through each schedule
          uniqueBufferTimes.add(schedule.buffer_time);
          uniqueSlotCounts.add(schedule.slotcount);
          uniquePrices.add(schedule.price);
  
          // Check for common buffer time
          if (commonBufferTime === '' || commonBufferTime === schedule.buffer_time) {
            commonBufferTime = schedule.buffer_time;
          } else {
            allBufferTimesSame = false;
          }
  
          // Check for common slot count
          if (commonSlotCount === '' || commonSlotCount === schedule.slotcount) {
            commonSlotCount = schedule.slotcount;
          }
  
          // Check for common price
          if (commonPrice === '' || commonPrice === schedule.price) {
            commonPrice = schedule.price;
          }
  
          // Push each schedule into the form array
          this.schedules.push(this.fb.group({
            day: [schedule.day_name],
            startTime: [schedule.start_time],
            endTime: [schedule.end_time],
            section: [schedule.section],
            slotcount: [schedule.slotcount],
            eachslots: [schedule.eachSlot],
            bufferTime: [schedule.buffer_time],  // Add individual buffer time for each schedule
            Price: [schedule.price],
          }));
        });
  
        // If all buffer times are the same, set the same buffer time across all schedule forms for that day
        if (allBufferTimesSame) {
          this.schedules.controls.forEach((control: any) => {
            control.get('bufferTime').setValue(commonBufferTime);  // Set the same bufferTime for all schedules
          });
        }
  
        console.log('Unique buffer times for', day, Array.from(uniqueBufferTimes));
        console.log('Unique slot counts for', day, Array.from(uniqueSlotCounts));
        console.log('Unique prices for', day, Array.from(uniquePrices));
      }
    });
  
    // If all buffer times, slot counts, and prices are the same across all days, log or set them
    if (allBufferTimesSame) {
      console.log('Common buffer time for all days:', commonBufferTime);
      console.log('Common slot count for all days:', commonSlotCount);
      console.log('Common price for all days:', commonPrice);
  
      // Set the common values in your component
      this.selectedBufferTime = commonBufferTime; // Set the common buffer time for all schedules
      this.selectedSlotCount = commonSlotCount; // Set the common slot count
      this.selectedPrice = commonPrice; // Set the common price
    } else {
      console.log('Buffer times are not the same across all schedules.');
    }
  
    // Ensure the selected slot count is applied to each form control if needed
    this.schedules.controls.forEach((control: any) => {
      control.get('slotcount').setValue(this.selectedSlotCount); // Explicitly set the slotcount value
    });
  }
  
  
  
  // Helper function to group data by a key (day_name in this case)
  private groupBy(array: any[], key: string) {
    return array.reduce((result, currentItem) => {
      (result[currentItem[key]] = result[currentItem[key]] || []).push(currentItem);
      return result;
    }, {});
  }
  
  
  
  
  
  
  sortScheduleData(scheduleData: any[]) {
    const dayOrder = ['monday', 'tuesday', 'thursday', 'wednesday', 'friday', 'saturday', 'sunday']; // Days in preferred order
  
    return scheduleData.sort((a, b) => {

      const dayA = (a.day_name?.trim().toLowerCase() || '');
      const dayB = (b.day_name?.trim().toLowerCase() || '');
      const indexA = dayOrder.indexOf(dayA);
      const indexB = dayOrder.indexOf(dayB);
      if (indexA === indexB) return 0;
      return indexB - indexA;
    });
  }
  
  

 
}
