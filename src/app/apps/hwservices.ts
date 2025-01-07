import { Component, ViewChild } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiService } from 'src/app/api.service';

@Component({
  templateUrl: "./hwservices.html",
  animations: [toggleAnimation],
})
export class hwservicesComponent {
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
  isLoading: boolean = false;

  initForm() {
    this.params = this.fb.group({
      id: [0],
      section_name: ["", Validators.required], // Changed to section_name
      section_code: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.initForm(); // Initialize form in ngOnInit
    this.fetchdataes(); // Fetch dataes on initialization
  }

  fetchdataes() {
    this.apiService.get("read/tbl_section").subscribe(
    // this.http.get("http://localhost/OPDClinic/read/tbl_section").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data; // Assign data to contactList
          this.searchContacts(); // Update filtered list
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching dataes:", error);
        this.showMessage("Error fetching dataes.", "error");
      }
    );
  }

  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.section_name.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  editUser(user: any = null) {
    this.addContactModal.open();
    this.initForm();
    if (user) {
      this.params.setValue({
        id: user.id,
        section_name: user.section_name,
        section_code: user.section_code,
      });
    }
  }

  saveUser() {
    if (this.params.invalid) {
      this.showMessage("Please fill all required fields.", "error");
      return;
    }
    this.isLoading = true;
    const formData = this.params.value;
    const requestBody = {
      section_name: formData.section_name,
      section_code: formData.section_code,
    };

    if (formData.id) {
      // Update user in the API
      // this.http
      //   .post(
      //     `http://localhost/OPDClinic/update/tbl_section/${formData.id}`,
      //     requestBody
      //   )
      //   .subscribe(
        this.apiService.post("submitPayment", requestBody).subscribe(

          (response) => {
            this.isLoading = false;
            console.log("Update response:", response);
            let user: any = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.section_name = formData.section_name;
              user.section_code = formData.section_code;
            }
            this.fetchdataes();

            this.showMessage("data has been updated successfully.");
            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false;
            console.error("Error updating data:", error);
            this.showMessage("Error updating data.", "error");
          }
        )
        .add(() => {
          // Set loading state to false after response or error
          this.isLoading = false;
        });
    } else {
      // Add user to the API
      // this.http
      //   .post("http://localhost/OPDClinic/create/tbl_section", requestBody)
      //   .subscribe(
        this.apiService.post("create/tbl_section", requestBody).subscribe(

          (response) => {
            console.log("Create response:", response);
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              section_name: formData.section_name,
              section_code: formData.section_code,
            };
            this.contactList.unshift(newUser);
            this.searchContacts();
            this.fetchdataes();

            this.showMessage("data has been saved successfully.");
            this.addContactModal.close();
          },
          (error) => {
            console.error("Error saving data:", error);
            this.showMessage("Error saving data.", "error");
          }
        )
        .add(() => {
          // Set loading state to false after response or error
          this.isLoading = false;
        });
    }
  }

  // deleteUser(formData: any) {
  //   const requestBody = {};

  //   this.http
  //     .post(
  //       `http://localhost/OPDClinic/delete/tbl_section/${formData.id}`,
  //       requestBody
  //     )
  //     .subscribe(
  //       (response) => {
  //         this.isLoading = false;
  //         console.log("Create response:", response);
  //         let newUser = {
  //           id: this.contactList.length
  //             ? Math.max(...this.contactList.map((u) => u.id)) + 1
  //             : 1,
  //           section_name: formData.section_name,
  //           section_code: formData.section_code,
  //         };
  //         this.contactList.unshift(newUser);
  //         this.searchContacts();
  //         this.fetchdataes();

  //         this.showMessage("data has been saved successfully.");
  //         this.addContactModal.close();
  //       },
  //       (error) => {
  //         this.isLoading = false;
  //         console.error("Error saving data:", error);
  //         this.showMessage("Error saving data.", "error");
  //       }
  //     );
  // }
  deleteUser(formData: any) {
    const requestBody = {};  // You can add necessary data for deletion if needed
  
    // Use ApiService to send the delete request
    this.apiService
      .post(`delete/tbl_section/${formData.id}`, requestBody)
      .subscribe(
        (response) => {
          this.isLoading = false;
          console.log("Delete response:", response);
  
          // Remove the deleted user from the contact list
          this.contactList = this.contactList.filter((user) => user.id !== formData.id);
          this.searchContacts();  // Update search results
          this.fetchdataes();     // Refresh the data
  
          this.showMessage("Data has been deleted successfully.");
          this.addContactModal.close();  // Close modal after success
        },
        (error) => {
          this.isLoading = false;
          console.error("Error deleting data:", error);
          this.showMessage("Error deleting data.", "error");
        }
      )
      .add(() => {
        this.isLoading = false;  // Stop loading after response/error
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
}
