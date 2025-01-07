import { Component, ViewChild, OnInit } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http"; // Import HttpClient
import { ApiService } from 'src/app/api.service';

@Component({
  templateUrl: "./radiologytest.html",
  animations: [toggleAnimation],
})
export class RadiologyTestComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,

  ) {} // Inject HttpClient

  displayType = "list";
  @ViewChild("addContactModal") addContactModal!: NgxCustomModalComponent;
  params!: FormGroup;
  filterdContactsList: any = [];
  searchUser = "";
  contactList: any[] = []; // Initialize empty array

  // Initialize the form
  initForm() {
    this.params = this.fb.group({
      id: [0],
      name: ["", Validators.required],
    });
  }

  // Fetch radiology tests when the component is initialized
  ngOnInit() {
    this.initForm();
    this.fetchRadiologyTests(); // Fetch the list of radiology tests on initialization
  }

  // Fetch radiology tests from the API
  fetchRadiologyTests() {
    // this.http.get("http://localhost/OPDClinic/read/tbl_radiologytest").subscribe(
      this.apiService.get("read/tbl_radiologytest").subscribe(

        (response: any) => {
          if (response.status === 200) {
            this.contactList = response.data;
            this.searchContacts(); // Filter the list based on search
          } else {
            this.showMessage(response.message, "error");
          }
        },
        (error) => {
          console.error("Error fetching radiology tests:", error);
          this.showMessage("Error fetching radiology tests.", "error");
        }
      );
  }

  // Search through the list of contacts
  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.name.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  // Open the modal for adding or editing a user
  editUser(user: any = null) {
    this.addContactModal.open();
    this.initForm();
    if (user) {
      this.params.setValue({
        id: user.id,
        name: user.name,
      });
    }
  }

  // Save the user (either add or update)
  saveUser() {
    if (this.params.invalid) {
      this.showMessage("Please fill all required fields.", "error");
      return;
    }

    const formData = this.params.value;
    const requestBody = {
      name: formData.name,
    };

    if (formData.id) {
      // Update the radiology test
      // this.http.post(`http://localhost/OPDClinic/update/tbl_radiologytest/${formData.id}`,requestBody).subscribe(
        this.apiService.post(`update/tbl_radiologytest/${formData.id}`, requestBody).subscribe(   
        (response: any) => {
            let user = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.name = formData.name;
            }
            this.fetchRadiologyTests();
            this.showMessage("Radiology test has been updated successfully.");
            this.addContactModal.close();
          },
          (error) => {
            console.error("Error updating radiology test:", error);
            this.showMessage("Error updating radiology test.", "error");
          }
        );
    } else {
      // Add a new radiology test
      // this.http.post("http://localhost/OPDClinic/create/tbl_radiologytest",requestBody).subscribe(
        this.apiService.post(`create/tbl_radiologytest`, requestBody).subscribe(   

          (response: any) => {
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              name: formData.name,
            };
            this.contactList.unshift(newUser);
            this.searchContacts();
            this.fetchRadiologyTests();

            this.showMessage("Radiology test has been saved successfully.");
            this.addContactModal.close();
          },
          (error) => {
            console.error("Error saving radiology test:", error);
            this.showMessage("Error saving radiology test.", "error");
          }
        );
    }
  }

  // Delete a radiology test
  deleteUser(user: any) {
    const requestBody = {};
    this.apiService.post(`delete/tbl_radiologytest/${user.id}`, requestBody).subscribe(   

    // this.http.post(`http://localhost/OPDClinic/delete/tbl_radiologytest/${user.id}`,requestBody).subscribe(
        (response: any) => {
          this.contactList = this.contactList.filter((d) => d.id !== user.id);
          this.searchContacts();
          this.fetchRadiologyTests();
          this.showMessage("Radiology test has been deleted successfully.");
        },
        (error) => {
          console.error("Error deleting radiology test:", error);
          this.showMessage("Error deleting radiology test.", "error");
        }
      );
  }

  // Show messages using SweetAlert
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
