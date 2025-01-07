import { Component, ViewChild, OnInit } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

@Component({
  templateUrl: "./menu.html",
  animations: [toggleAnimation],
})
export class MenuComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
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
      menu_name: ["", Validators.required], // Changed to menu_name
      url_location: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.initForm(); // Initialize form in ngOnInit
    this.fetchMenus(); // Fetch Menus on initialization
  }

  fetchMenus() {
    this.http.get("http://localhost/OPDClinic/read/tbl_menu").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data; // Assign data to contactList
          this.searchContacts(); // Update filtered list
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching menus:", error);
        this.showMessage("Error fetching menus.", "error");
      }
    );
  }

  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.menu_name.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  editUser(user: any = null) {
    this.addContactModal.open();
    this.initForm();
    if (user) {
      this.params.setValue({
        id: user.id,
        menu_name: user.menu_name,
        url_location: user.url_location,
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
      menu_name: formData.menu_name,
      url_location: formData.url_location,
    };

    if (formData.id) {
      // Update user in the API
      this.http
        .post(
          `http://localhost/OPDClinic/update/tbl_menu/${formData.id}`,
          requestBody
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            console.log("Update response:", response);
            let user: any = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.menu_name = formData.menu_name;
              user.url_location = formData.url_location;
            }
            this.showMessage("Data has been updated successfully.");
            this.addContactModal.close();
            this.fetchMenus();
          },
          (error) => {
            this.isLoading = false;
            console.error("Error updating Data:", error);
            this.showMessage("Error updating Data.", "error");
          }
        );
    } else {
      // Add user to the API
      this.http
        .post("http://localhost/OPDClinic/create/tbl_menu", requestBody)
        .subscribe(
          (response) => {
            this.isLoading = false;
            console.log("Create response:", response);
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              menu_name: formData.menu_name,
              url_location: formData.url_location,
            };
            this.contactList.unshift(newUser);
            this.searchContacts();
            this.showMessage("Data has been saved successfully.");
            this.addContactModal.close();
            this.fetchMenus();
          },
          (error) => {
            this.isLoading = false;
            console.error("Error saving Data:", error);
            this.showMessage("Error saving Data.", "error");
          }
        );
    }
  }

  deleteUser(formData: any) {
    const requestBody = {};

    this.http
      .post(
        `http://localhost/OPDClinic/delete/tbl_menu/${formData.id}`,
        requestBody
      )
      .subscribe(
        (response) => {
          console.log("Delete response:", response);
          this.contactList = this.contactList.filter(
            (d) => d.id !== formData.id
          );
          this.showMessage("Data has been deleted successfully.");
          this.addContactModal.close();
          this.fetchMenus();
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
