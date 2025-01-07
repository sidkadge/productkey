import { Component, ViewChild, OnInit } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { HttpClient } from "@angular/common/http";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { ApiService } from 'src/app/api.service';

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.html",
  animations: [toggleAnimation],
  styleUrls: ["./calendar.css"],
})
export class CalendarComponent implements OnInit {
  // Declare the modal visibility flag
  isModalVisible: boolean = false;
  @ViewChild("isAddEventModal") isAddEventModal!: NgxCustomModalComponent;
  @ViewChild("calendar") calendar!: FullCalendarComponent;

  defaultParams = {
    id: null,
    title: "",
    start: "",
    end: "",
    description: "",
    consultant_name: "",
    section_name: "",
    type: "primary",
    displayDateTime: "",
  };

  params!: FormGroup;
  minStartDate: any = "";
  minEndDate: any = "";
  events: any = [];
  calendarOptions: any;

  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
  ) {
    this.initCalendar();
  }

  ngOnInit() {
    this.initForm();
    this.getEvents();
  }

  initCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      editable: true,
      dayMaxEvents: true,
      selectable: false, // Disable date selection
      droppable: true,
      eventClick: (eventClickInfo: EventClickArg) =>
        this.editEvent(eventClickInfo), // Pass eventClickInfo for details
    };
  }

  // Method to close the modal
  closeModal(): void {
    this.isModalVisible = false; // Hide the modal
  }

  // Method to show the modal (you can call this on event click or trigger)
  showModal(event: any): void {
    console.log("Show Modal called with event:", event); // Verify event data

    if (event) {
      // Format the start date to show it in the desired format (DD/MM/YYYY, HH:mm AM/PM)
      const formattedStartDate = new Date(event.start).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric", // Full 4-digit year
        // hour: "2-digit",
        // minute: "2-digit",
        // hour12: true, // To display AM/PM
      });

      // Include slot time if available
      const slotsTime = event.extendedProps?.slots_time
        ? ` - ${event.extendedProps.slots_time}`
        : "";

      // Set values in the params form group
      this.params.setValue({
        id: event.publicId || this.defaultParams.id,
        title: event.title || this.defaultParams.title,
        start: event.start || this.defaultParams.start,
        end: event.end || this.defaultParams.end,
        description: event.description || this.defaultParams.description,
        type: event.type || this.defaultParams.type,
        consultant_name:
          event.extendedProps?.consultant_name ||
          this.defaultParams.consultant_name,
        section_name:
          event.extendedProps?.section_name || this.defaultParams.section_name,
        displayDateTime: formattedStartDate + slotsTime, // Add the slot time here
      });

      // Open the modal
      this.isModalVisible = true;
    }
  }

  initForm() {
    this.params = this.fb.group({
      id: null,
      title: ["", Validators.required],
      start: ["", Validators.required],
      end: ["", Validators.required],
      description: [""],
      type: ["primary"],
      consultant_name: [""], // Add this field
      section_name: [""], // Add this field
      displayDateTime: [""],
    });
  }
//   getEvents() {
//     // Fetch event data from API
//     this.apiService.get("readAppointments").subscribe(
// //  this.http.get<any>("http://localhost/OPDClinic/readAppointments").subscribe(
//     (response: any) => {
//         if (response.status === 200) {
//           this.calendarOptions.events = response.data.map((event: any) => {
//             // Debugging: Log the section name
//             console.log("Event", event);

//             // Accessing nested data for event details
//             const appointment = event.appointment_data; // The appointment details are nested here
//             const formattedDateTime = new Date(
//               appointment.dates
//             ).toLocaleString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric", // Display full 4-digit year
//               hour: "2-digit",
//               minute: "2-digit",
//               hour12: true, // To display AM/PM
//             });

//             const sectionName = (event.section_name || "").toLowerCase();

//             let backgroundColor = "blue"; // Default color

//             const normalizedSectionName = sectionName.trim().toLowerCase();
//             console.log("Normalized Section Name:", normalizedSectionName);
//             if (normalizedSectionName === "physiotherapy") {
//               backgroundColor = "red";
//             } else if (normalizedSectionName === "exercise") {
//               backgroundColor = "blue";
//             } else if (normalizedSectionName === "nutritionist") {
//               backgroundColor = "green";
//             } else if (normalizedSectionName === "ayurved") {
//               backgroundColor = "pink";
//             } else {
//               console.log(
//                 "Section name does not match any condition:",
//                 normalizedSectionName
//               ); // Log if none of the conditions match
//             }

//             return {
//               title: appointment.full_name, // Access full_name from appointment_data
//               start: appointment.dates, // Access dates from appointment_data
//               end: appointment.dates, // Same as start if it's a single day event
//               consultant_name: event.consultant_name,
//               section_name: event.section_name, // section_name is directly in the event
//               description: appointment.healthissues, // Access healthissues from appointment_data
//               type: appointment.plan, // Access plan from appointment_data
//               displayDateTime: formattedDateTime,
//               backgroundColor: backgroundColor, // Set the background color
//               borderColor: backgroundColor, // Optional: border color to match
//               extendedProps: {
//                 consultant_name: event.consultant_name, // Nested consultant_name
//                 section_name: event.section_name, // section_name is at the event level
//                 slots_time: event.slots_time, // Include the slot time
//               },
//             };
//           });

//           // Refetch events for the calendar to reflect changes
//           this.calendar.getApi().refetchEvents();
//         }
//       });
//   }
getEvents() {
  // Retrieve the role from localStorage
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  console.log(localStorage)
  const payload = {
    id: userId,
    role:role,
  
  };
  // Set the default API endpoint
  let apiEndpoint = "readAppointments";

  // If the role is 'consultant', use a different API endpoint
  if (role === "consultant" && userId) {
    apiEndpoint = "readAppointments";
  }

  // Call the API based on the endpoint
  this.apiService.post(apiEndpoint,payload).subscribe(
    (response: any) => {
      if (response.status === 200) {
        this.calendarOptions.events = response.data.map((event: any) => {
          console.log("Event", event);

          const appointment = event.appointment_data;
          const formattedDateTime = new Date(appointment.dates).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const sectionName = (event.section_name || "").toLowerCase();

          let backgroundColor = "blue"; // Default color

          const normalizedSectionName = sectionName.trim().toLowerCase();
          console.log("Normalized Section Name:", normalizedSectionName);
          if (normalizedSectionName === "physiotherapy") {
            backgroundColor = "red";
          } else if (normalizedSectionName === "exercise") {
            backgroundColor = "blue";
          } else if (normalizedSectionName === "nutritionist") {
            backgroundColor = "green";
          } else if (normalizedSectionName === "ayurved") {
            backgroundColor = "pink";
          } else {
            console.log("Section name does not match any condition:", normalizedSectionName);
          }

          return {
            title: appointment.full_name,
            start: appointment.dates,
            end: appointment.dates,
            consultant_name: event.consultant_name,
            section_name: event.section_name,
            description: appointment.healthissues,
            type: appointment.plan,
            displayDateTime: formattedDateTime,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            extendedProps: {
              consultant_name: event.consultant_name,
              section_name: event.section_name,
              slots_time: event.slots_time,
            },
          };
        });

        // Refetch events for the calendar to reflect changes
        this.calendar.getApi().refetchEvents();
      }
    },
    (error) => {
      console.error("Error fetching events:", error);
    }
  );
}

  editEvent(event: EventClickArg): void {
    console.log("Event details:", event); // Check the structure of the event object

    if (!this.isModalVisible) {
      this.isModalVisible = true;
    }

    // Show modal and pass the event
    this.showModal(event.event); // Adjust if 'event.event' is incorrect
  }

  dateFormat(dt: any) {
    const dates = new Date(dt);
    return dates.toISOString().slice(0, 16); // Returns 'YYYY-MM-DDTHH:MM' format
  }

  saveEvent() {
    if (!this.params.valid) {
      return;
    }

    if (this.params.value.id) {
      // Update existing event
      let event = this.events.find((d: any) => d.id == this.params.value.id);
      event.title = this.params.value.title;
      event.start = this.params.value.start;
      event.end = this.params.value.end;
      event.description = this.params.value.description;
      event.className = this.params.value.type;
    } else {
      // Add new event
      let maxEventId =
        this.events.length > 0
          ? Math.max(...this.events.map((e: any) => e.id))
          : 0;
      let event = {
        id: maxEventId + 1,
        title: this.params.value.title,
        start: this.params.value.start,
        end: this.params.value.end,
        description: this.params.value.description,
        className: this.params.value.type,
      };
      this.events.push(event);
    }
    this.calendar.getApi().refetchEvents();
    Swal.fire("Success", "Event has been saved successfully.", "success");
    this.isAddEventModal.close();
  }

  startDateChange(event: any) {
    const dateStr = event.target.value;
    if (dateStr) {
      this.minEndDate = this.dateFormat(dateStr);
      this.params.patchValue({ end: "" });
    }
  }
}
