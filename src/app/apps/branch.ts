import { Component, ViewChild, OnInit } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
// import { environment } from "src/environments/environment";
import { ApiService } from 'src/app/api.service';

@Component({
  templateUrl: "./branch.html",
  animations: [toggleAnimation],
})
export class BranchComponent implements OnInit {
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
      branch_name: ["", Validators.required],
      address: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.initForm();
    this.fetchBranches();
  }

  fetchBranches() {
    // this.http.get(`http://localhost/OPDClinic/read/tbl_branch`).subscribe(
      this.apiService.get("read/tbl_branch").subscribe(

      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data;
          this.searchContacts();
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching branches:", error);
        this.showMessage("Error fetching branches.", "error");
      }
    );
  }

  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.branch_name.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  editUser(user: any = null) {
    this.addContactModal.open();
    this.initForm();
    if (user) {
      this.params.setValue({
        id: user.id,
        branch_name: user.branch_name,
        address: user.address,
      });
    }
  }

  // saveUser() {
  //   if (this.params.invalid) {
  //     this.showMessage("Please fill all required fields.", "error");
  //     return;
  //   }

  //   const formData = this.params.value;
  //   const requestBody = {
  //     branch_name: formData.branch_name,
  //     address: formData.address,
  //   };

  //   if (formData.id) {
  //     // Update user in the API
  //     this.http.post(`http://localhost/OPDClinic/update/tbl_branch/${formData.id}`, requestBody).subscribe(
  //       (response) => {
  //         console.log("Update response:", response);
  //         let user: any = this.contactList.find((d) => d.id === formData.id);
  //         if (user) {
  //           user.branch_name = formData.branch_name;
  //           user.address = formData.address;
  //         }
  //         this.showMessage("Branch has been updated successfully.");
  //         this.addContactModal.close();
  //       },
  //       (error) => {
  //         console.error("Error updating branch:", error);
  //         this.showMessage("Error updating branch.", "error");
  //       }
  //     );
  //   } else {
  //     // Add user to the API
  //     this.http.post('http://localhost/OPDClinic/create/tbl_branch', requestBody).subscribe(
  //       (response) => {
  //         console.log("Create response:", response);
  //         let newUser = {
  //           id: this.contactList.length ? Math.max(...this.contactList.map(u => u.id)) + 1 : 1,
  //           branch_name: formData.branch_name,
  //           address: formData.address,
  //         };
  //         this.contactList.unshift(newUser);
  //         this.searchContacts();
  //         this.showMessage("Branch has been saved successfully.");
  //         this.addContactModal.close();
  //       },
  //       (error) => {
  //         console.error("Error saving branch:", error);
  //         this.showMessage("Error saving branch.", "error");
  //       }
  //     );
  //   }
  // }
  saveUser() {
    if (this.params.invalid) {
      this.showMessage("Please fill all required fields.", "error");
      return;
    }

    this.isLoading = true; // Set loading to true when starting the request

    const formData = this.params.value;
    const requestBody = {
      branch_name: formData.branch_name,
      address: formData.address,
    };

    if (formData.id) {
      // Update user in the API
      // this.http.post(`http://localhost/OPDClinic/update/tbl_branch/${formData.id}`,requestBody).subscribe(
        const endpoint = `update/tbl_branch/${formData.id}`;
        this.apiService.post(endpoint,requestBody).subscribe(

        (response) => {
            this.isLoading = false; // Reset loading state
            console.log("Update response:", response);
            let user: any = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.branch_name = formData.branch_name;
              user.address = formData.address;
            }
            this.showMessage("Branch has been updated successfully.");
            this.fetchBranches();

            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false; // Reset loading state in case of error
            console.error("Error updating branch:", error);
            this.showMessage("Error updating branch.", "error");
          }
        );
    } else {
      // Add user to the API
    
      // this.http.post("http://localhost/OPDClinic/create/tbl_branch", requestBody).subscribe(
        const endpoint = `create/tbl_branch`;
        this.apiService.post(endpoint,requestBody).subscribe(

        (response) => {
            this.isLoading = false; // Reset loading state
            console.log("Create response:", response);
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              branch_name: formData.branch_name,
              address: formData.address,
            };
            this.contactList.unshift(newUser);
            this.searchContacts();
            this.fetchBranches();

            this.showMessage("Branch has been saved successfully.");
            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false; // Reset loading state in case of error
            console.error("Error saving branch:", error);
            this.showMessage("Error saving branch.", "error");
          }
        );
    }
  }

  deleteUser(formData: any) {
    const requestBody = {};
    const endpoint = `delete/tbl_branch/${formData.id}`;
    this.apiService.post(endpoint,requestBody).subscribe(
    // this.http.post(`http://localhost/OPDClinic/delete/tbl_branch/${formData.id}`,requestBody).subscribe(
        (response) => {
          console.log("Delete response:", response);
          this.contactList = this.contactList.filter(
            (d) => d.id !== formData.id
          );
          this.fetchBranches();

          this.showMessage("Branch has been deleted successfully.");
          this.addContactModal.close();
        },
        (error) => {
          console.error("Error deleting branch:", error);
          this.showMessage("Error deleting branch.", "error");
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
