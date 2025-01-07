import { Component, ViewChild } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiService } from 'src/app/api.service';

@Component({
  templateUrl: "./labtest.html",
  animations: [toggleAnimation],
})
export class LabTestComponent {
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

  initForm() {
    this.params = this.fb.group({
      id: [0],
      name: ["", Validators.required], // Changed to name
    });
  }

  ngOnInit() {
    this.initForm(); // Initialize form in ngOnInit
    this.fetchDataes(); // Fetch Dataes on initialization
  }

  fetchDataes() {
    // this.http.get("http://localhost/OPDClinic/read/tbl_labtest").subscribe(
      this.apiService.get("read/tbl_labtest").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data; // Assign data to contactList
          this.searchContacts(); // Update filtered list
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching Dataes:", error);
        this.showMessage("Error fetching Dataes.", "error");
      }
    );
  }

  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.name.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

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
      // Update user in the API
      // this.http.post(`http://localhost/OPDClinic/update/tbl_labtest/${formData.id}`,requestBody).subscribe(
        this.apiService.post(`update/tbl_labtest/${formData.id}`, requestBody).subscribe(   

        (response) => {
            console.log("Update response:", response);
            let user: any = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.name = formData.name;
            }
            this.fetchDataes();
            this.showMessage("Data has been updated successfully.");
            this.addContactModal.close();
          },
          (error) => {
            console.error("Error updating Data:", error);
            this.showMessage("Error updating Data.", "error");
          }
        );
    } else {
      // Add user to the API
      // this.http.post("http://localhost/OPDClinic/create/tbl_labtest", requestBody).subscribe(
        this.apiService.post(`create/tbl_labtest`, requestBody).subscribe(   

          (response) => {
            console.log("Create response:", response);
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              name: formData.name,
            };
            this.contactList.unshift(newUser);

            this.searchContacts();
            this.fetchDataes();
            this.showMessage("Data has been saved successfully.");
            this.addContactModal.close();
          },
          (error) => {
            console.error("Error saving Data:", error);
            this.showMessage("Error saving Data.", "error");
          }
        );
    }
  }

  deleteUser(formData: any) {
    const requestBody = {};

    // this.http.post(`http://localhost/OPDClinic/delete/tbl_labtest/${formData.id}`,requestBody).subscribe(
      this.apiService.post(`delete/tbl_labtest/${formData.id}`, requestBody).subscribe(   

      (response) => {
          console.log("Delete response:", response);
          this.contactList = this.contactList.filter(
            (d) => d.id !== formData.id
          );
          this.fetchDataes();
          this.showMessage("Data has been deleted successfully.");
          this.addContactModal.close();
        },
        (error) => {
          console.error("Error deleting Data:", error);
          this.showMessage("Error deleting Data.", "error");
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
