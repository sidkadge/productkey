import { Component, ViewChild, OnInit } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
// import { environment } from "src/environments/environment";
import { ApiService } from 'src/app/api.service';
import * as CryptoJS from 'crypto-js';
import * as LZString from 'lz-string';
@Component({
  templateUrl: "./hms.html",
  animations: [toggleAnimation],
})
export class HmsComponent implements OnInit {
  productKey: string | null = null;
  encryptedKey: string = '';
  encryptionKey: string = '';
  
  iv: string = '';
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,

    
  ) {
    this.params = this.fb.group({
      uuid: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      pctype: ['', Validators.required]
      
    });
    // this.generateEncryptionKey();
    this.encryptionKey = "HMSKey@123456789"
    this.iv = '@HMSIV1234567890';
  }

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
      Clientname :['',Validators.required],
      uuid: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      pctype: ['', Validators.required],
      encryptedKey: [''],
    });
  }

  ngOnInit() {
    this.initForm();
    this.fetchClinics();
  }

  fetchClinics() {
    // this.http.get(`http://localhost/OPDClinic/read/tbl_opdproductkey`).subscribe(
      this.apiService.get("read/tbl_offlineproductkey").subscribe(

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
      d.Clientname.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  editUser(user: any = null) {
    this.addContactModal.open();
    this.initForm();
    if (user) {
      this.params.setValue({
        id: user.id,
        Clientname: user.Clientname,
        uuid: user.uuid,
        startDate : user.startDate,
        endDate : user.endDate,
        pctype : user.pctype,
        encryptedKey: user.encryptedKey,
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
      Clientname: formData.Clientname,
      uuid: formData.uuid,
      startDate : formData.startDate,
      endDate : formData.endDate,
      pctype:formData.pctype,
      encryptedKey: this.encryptedKey, 
    };
console.log(requestBody)
    if (formData.id) {
      // Update user in the API
      // this.http.post(`http://localhost/OPDClinic/update/tbl_opdproductkey/${formData.id}`,requestBody).subscribe(
        const endpoint = `updatetofflineproductkey/tbl_offlineproductkey/${formData.id}`;
        this.apiService.post(endpoint,requestBody).subscribe(

        (response) => {
            this.isLoading = false; // Reset loading state
            console.log("Update response:", response);
            let user: any = this.contactList.find((d) => d.id === formData.id);
            if (user) {
              user.Clientname = formData.Clientname;
              user.uuid = formData.uuid;
              user.startDate = formData.startDate;
              user.endDate = formData.endDate;
              user.pctype = formData.pctype;
              user.encryptedKey = this.encryptedKey;
            }
            this.showMessage("Client has been updated successfully.");
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
        const endpoint = `createtofflineproductkey/tbl_offlineproductkey`;
        this.apiService.post(endpoint,requestBody).subscribe(

        (response) => {
            this.isLoading = false; // Reset loading state
            console.log("Create response:", response);
            let newUser = {
              id: this.contactList.length
                ? Math.max(...this.contactList.map((u) => u.id)) + 1
                : 1,
                Clientname: formData.Clientname,
                uuid: formData.uuid,
                startDate: formData.startDate,
                endDate : formData.endDate,
                pctype : formData.pctype,
                encryptedKey: this.encryptedKey,
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
    const endpoint = `delete/tbl_offlineproductkey/${formData.id}`;
    this.apiService.post(endpoint,requestBody).subscribe(
    // this.http.post(`http://localhost/OPDClinic/delete/tbl_opdproductkey/${formData.id}`,requestBody).subscribe(
        (response) => {
          console.log("Delete response:", response);
          this.contactList = this.contactList.filter(
            (d) => d.id !== formData.id
          );
          this.fetchClinics();

          this.showMessage("Client has been deleted successfully.");
          this.addContactModal.close();
        },
        (error) => {
          console.error("Error deleting Clinics:", error);
          this.showMessage("Error deleting Clinics.", "error");
        }
      );
  }
  generateAndEncryptProductKey() {
    if (this.params.valid) {
      const { uuid, startDate, endDate, pctype } = this.params.value;

      // Convert startDate and endDate to 'dd-MM-yyyy' format
      const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      const currentDate = new Date();
      const formattedCurrentDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${currentDate.getFullYear()}`;

        console.log(formattedCurrentDate);
      // Validate that the end date is after the start date
      if(new Date(formattedStartDate) < new Date(formattedCurrentDate))
      {
        alert('Start date must be greater or should be Current Date!');
        return;
      }
      
      // if (new Date(formattedEndDate) > new Date(formattedStartDate)) {
      //   alert('End date must be greater than start date!');
      //   return;
      // }
      if(new Date(formattedStartDate) > new Date(formattedEndDate))
      {
        alert('Start date should not be greater than End Date!');
        return;
      }
      const shortUuid = uuid.substring(0, 8); 
      const shortPctype = pctype.substring(0, 3);
      const uuidLength = uuid.length;
      this.productKey = `${uuidLength}${shortUuid}${formattedStartDate}${formattedEndDate}~${shortPctype}`;

      this.encryptedKey = this.encrypt(this.productKey);

      // console.log('Product Key:', this.productKey);
      // console.log('Encrypted Key:', this.encryptedKey);
    } else {
      alert('Please fill out all fields correctly.');
    }
  }

  private encrypt(data: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const iv = CryptoJS.enc.Utf8.parse(this.iv);

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        // Tooltip will automatically display when using [matTooltip] directive
      },
      (err) => {
        console.error('Could not copy text: ', err);
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
