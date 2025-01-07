import { Component, ViewChild, OnInit } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
// import { environment } from "src/environments/environment";
import { ApiService } from 'src/app/api.service';

@Component({
  templateUrl: "./addclinic.html",
  animations: [toggleAnimation],
})
export class AddclinicComponent implements OnInit {
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
      clinicname: ["", Validators.required],
      Project_Url: ["", Validators.required],
      subscribtion_startdate: ['', Validators.required],
      subscribtion_enddate: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.initForm();
    this.fetchClinics();
  }

  fetchClinics() {
    // this.http.get(`http://localhost/OPDClinic/read/tbl_opdproductkey`).subscribe(
      this.apiService.get("read/tbl_opdproductkey").subscribe(

      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data;
          this.searchContacts();
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching Clinics:", error);
        this.showMessage("Error fetching Clinics.", "error");
      }
    );
  }

  searchContacts() {
    this.filterdContactsList = this.contactList.filter((d) =>
      d.clinicname.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  editUser(user: any = null) {
    this.addContactModal.open();
    this.initForm();
    if (user) {
      this.params.setValue({
        id: user.id,
        clinicname: user.clinicname,
        Project_Url: user.Project_Url,
        subscribtion_startdate : user.subscribtion_startdate,
        subscribtion_enddate : user.subscribtion_enddate,
        
      });
    }
  }

  saveUser() {
    if (this.params.invalid) {
      this.showMessage("Please fill all required fields.", "error");
      return;
    }

    this.isLoading = true; // Set loading to true when starting the request

    const formData = this.params.value;
    const requestBody = {
      clinicname: formData.clinicname,
      Project_Url: formData.Project_Url,
      subscribtion_startdate : formData.subscribtion_startdate,
      subscribtion_enddate : formData.subscribtion_enddate,
    };

    if (formData.id) {
      // Update user in the API
      // this.http.post(`http://localhost/OPDClinic/update/tbl_opdproductkey/${formData.id}`,requestBody).subscribe(
        const endpoint = `update/tbl_opdproductkey/${formData.id}`;
        this.apiService.post(endpoint,requestBody).subscribe(

        (response) => {
            this.isLoading = false; // Reset loading state
            console.log("Update response:", response);
            let user: any = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.clinicname = formData.clinicname;
              user.Project_Url = formData.Project_Url;
              user.subscribtion_startdate = formData.subscribtion_startdate;
              user.subscribtion_enddate = formData.subscribtion_enddate;
            }
            this.showMessage("Clinics has been updated successfully.");
            this.fetchClinics();

            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false; // Reset loading state in case of error
            console.error("Error updating Clinics:", error);
            this.showMessage("Error updating Clinics.", "error");
          }
        );
    } else {
      // Add user to the API
    
      // this.http.post("http://localhost/OPDClinic/create/tbl_opdproductkey", requestBody).subscribe(
        const endpoint = `create/tbl_opdproductkey`;
        this.apiService.post(endpoint,requestBody).subscribe(

        (response) => {
            this.isLoading = false; // Reset loading state
            console.log("Create response:", response);
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
              clinicname: formData.clinicname,
              Project_Url: formData.Project_Url,
              subscribtion_startdate : formData.subscribtion_startdate,
              subscribtion_enddate : formData.subscribtion_enddate,
            };
            this.contactList.unshift(newUser);
            this.searchContacts();
            this.fetchClinics();

            this.showMessage("Clinics has been saved successfully.");
            this.addContactModal.close();
          },
          (error) => {
            this.isLoading = false; // Reset loading state in case of error
            console.error("Error saving Clinics:", error);
            this.showMessage("Error saving Clinics.", "error");
          }
        );
    }
  }

  deleteUser(formData: any) {
    const requestBody = {};
    const endpoint = `delete/tbl_opdproductkey/${formData.id}`;
    this.apiService.post(endpoint,requestBody).subscribe(
    // this.http.post(`http://localhost/OPDClinic/delete/tbl_opdproductkey/${formData.id}`,requestBody).subscribe(
        (response) => {
          console.log("Delete response:", response);
          this.contactList = this.contactList.filter(
            (d) => d.id !== formData.id
          );
          this.fetchClinics();

          this.showMessage("Clinics has been deleted successfully.");
          this.addContactModal.close();
        },
        (error) => {
          console.error("Error deleting Clinics:", error);
          this.showMessage("Error deleting Clinics.", "error");
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
