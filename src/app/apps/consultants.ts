import { Component, ViewChild } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiService } from 'src/app/api.service';

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    con_id: number; // Adjust this type to match your API's structure
  };
}

@Component({
  templateUrl: "./consultants.html",
  animations: [toggleAnimation],
})
export class ConsultantsComponent {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
  ) {}

  displayType = "list";
  @ViewChild("addContactModal") addContactModal!: NgxCustomModalComponent;
  params!: FormGroup;
  filterdContactsList: any = [];
  searchUser = "";
  contactList: any[] = []; // Initialize contactList as an empty array
  sectionsList: any[] = []; // Initialize sectionsList to hold section data
  isLoading: boolean = false;
  initForm() {
    this.params = this.fb.group({
      id: [0],
      name: ["", Validators.required],
      degree: ["", Validators.required],
      section: [null, Validators.required], // Set default to null initially
      role: ["Consultant", Validators.required], // Set default role to "Consultant"
      mobile: ["", Validators.required],
      password: ["", Validators.required],

    });
  }

  ngOnInit() {
    this.initForm();
    this.fetchSections(); // Fetch sections on initialization
    this.fetchdataes(); // Fetch dataes on initialization
    console.log(this.filterdContactsList); // Log data after fetching it
  }

  fetchSections() {
    // Use ApiService to fetch sections
    this.apiService.get("read/tbl_section").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.sectionsList = response.data; // Store sections in sectionsList
  
          // Set the default section value to the first section (if available)
          if (this.sectionsList.length > 0) {
            this.params.patchValue({ section: this.sectionsList[0].id }); // Set default to first section's id
          }
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
  

  fetchdataes() {
    // Use ApiService to fetch the data
    this.apiService.get("getsections").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data; // Assign data to contactList
          this.searchContacts(); // Update filtered list
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
        this.showMessage("Error fetching data.", "error");
      }
    );
  }
  

  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.name.toLowerCase().includes(this.searchUser.toLowerCase())
    );

    // Log the filtered contacts list
    console.log("filter", this.filterdContactsList);
  }
  editUser(user: any = null) {
    this.initForm(); // Initialize the form before opening the modal
    this.addContactModal.open();

    console.log("User to edit:", user); // Log the user object to check its contents

    if (user) {
      // Set the form with the current values from the user object
      this.params.patchValue({
        id: user.con_id || user.id, // Ensure con_id is set or fall back to another ID
        name: user.name,
        mobile: user.mobile,
        degree: user.degree,
        section: user.section, // Make sure section ID matches one in sectionsList
        role: user.role, 
        // password: user.password,
      });
    } else {
      console.warn("No user data provided to editUser.");
    }
  }

  saveUser() {
    if (this.params.invalid) {
      this.showMessage("Please fill all required fields.", "error");
      return;
    }
    this.isLoading = true;

    const formData = this.params.value;
    console.log("Form Data:", formData);

    // Prepare request body
    const requestBody = {
      name: formData.name,
      mobile: formData.mobile,
      degree: formData.degree,
      section: formData.section,
      role: formData.role,
      password: formData.password,
    };

    if (formData.id) {
      const endpoint = `createcunsltant/tbl_register/${formData.id}`;

      // console.log("kej")
      // Update user in the API using the con_id
      // this.http
      //   .post<ApiResponse>( // Specify the expected response type
      //     `http://localhost/OPDClinic/createcunsltant/tbl_register/${formData.id}`,
      //     requestBody
      //   )
      //   .subscribe(
        this.apiService.post(endpoint,requestBody).subscribe(

          (response) => {
            this.isLoading = false;
            console.log("Update response:", response);

            let user = this.contactList.find((d) => d.con_id === formData.id);
            if (user) {
              user.name = formData.name;
              user.degree = formData.degree;
              user.section = formData.section;
              user.role = formData.role;
              user.mobile =formData.mobile,
              user.password = formData.password;
            }
            this.fetchdataes(); // Fetch dataes on initialization

            this.showMessage("Data has been updated successfully.");
            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false;
            console.error("Error updating data:", error);
            this.showMessage("Error updating data.", "error");
          }
        );
    } else {
      const endpoint = `createcunsltant/tbl_register/${formData.id}`;

      // Add user to the API
      // this.http
      //   .post<ApiResponse>( // Specify the expected response type
      //     `http://localhost/OPDClinic/createcunsltant/tbl_register/${formData.id}`,
      //     requestBody
      //   )
        this.apiService.post(endpoint,requestBody).subscribe(
          (response) => {
            this.isLoading = false;
            console.log("Create response:", response);

            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              name: formData.name,
              degree: formData.degree,
              section: formData.section,
              role: formData.role,
              mobile: formData.mobile,
              password : formData.password,
            };

            this.contactList.unshift(newUser);
            this.searchContacts();
            this.fetchdataes(); // Fetch dataes on initialization

            this.showMessage("Data has been saved successfully.");
            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false;
            console.error("Error saving data:", error);
            this.showMessage("Error saving data.", "error");
          }
        );
    }
  }

  deleteUser(contact: any) {
    console.log("Contact object:", contact);
    if (!contact || !contact.con_id) {
      console.error("Contact or ID is undefined");
      this.showMessage("Invalid contact details.", "error");
      return;
    }
  
    // Use ApiService to handle the API call
    this.apiService.post(`delete/tbl_register/${contact.con_id}`, {}).subscribe(
      (response) => {
        console.log("Delete response:", response);
  
        // Remove the deleted user from the contact list
        this.contactList = this.contactList.filter(
          (d) => d.con_id !== contact.con_id
        );
  
        this.fetchdataes(); // Refresh the data list
        this.showMessage("Data has been deleted successfully.");
        this.addContactModal.close();
      },
      (error) => {
        console.error("Error deleting data:", error);
        this.showMessage("Error deleting data.", "error");
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
