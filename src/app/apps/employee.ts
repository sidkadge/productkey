import { Component, ViewChild } from "@angular/core";
import { toggleAnimation } from "src/app/shared/animations";
import Swal from "sweetalert2";
import { NgxCustomModalComponent } from "ngx-custom-modal";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl  } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiService } from 'src/app/api.service';

@Component({
  templateUrl: "./employee.html",
  animations: [toggleAnimation],
})
export class EmployeeComponent {
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
  contactList: any[] = [];
  sectionsList: any[] = [];
  accessLevelsList: any[] = [];
  resumeFile: File | null = null;
  isLoading: boolean = false;
  currentFileName: string | null | undefined = null;
  activeDropdown: string[] = [];

  previousResumeUrl: string | null = null; // For displaying the previous resume URL

  ngOnInit() {
    this.initForm();
    this.fetchSections(); // Fetch sections on component initialization
    this.fetchDataes();
    this.fetchAccessLevels();

    if (this.previousResumeUrl) {
      this.currentFileName = this.previousResumeUrl.split("/").pop(); // Extract file name from URL
    }
    this.accessLevelsList.forEach(() => {
      (this.params.get('accessLevels') as FormArray).push(new FormControl(false));
    });
    
  }

  onRoleChange(role: string): void {
    const accessLevels = this.params.get('accessLevels') as FormArray;
  
    // Reset all checkboxes
    accessLevels.controls.forEach((control) => control.setValue(false));
  
    // If role is 'Admin', select all access levels
    if (role === 'Admin') {
      this.accessLevelsList.forEach((level, index) => {
        accessLevels.at(index).setValue(true);
      });
    }
  }
  

  

  initForm() {
    this.params = this.fb.group({
      id: [""],
      section: [null, Validators.required],
      name: ["", Validators.required],
      // degree: ['', Validators.required],
      mobile: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      address: [""],
      resume: [null],
      userType: [""],

      role: ["", Validators.required],
      accessLevels: this.fb.array([]),
      joiningDate: [null, Validators.required],

      password: ["", [Validators.required, Validators.minLength(4)]],
    });
    this.initializeAccessLevels();
  }

  fetchAccessLevels() {
    this.apiService.get("read/tbl_menu").subscribe(
    // this.http.get("http://localhost/OPDClinic/read/tbl_menu").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.accessLevelsList = response.data.map((menu: any) => ({
            id: menu.id,
            name: menu.menu_name,
          }));
          this.initializeAccessLevels();
        } else {
          this.showMessage(response.message, "error");
        }
      },
      (error) => {
        console.error("Error fetching access levels:", error);
        this.showMessage("Error fetching access levels.", "error");
      }
    );
  }

  // initializeAccessLevels() {
  //   const accessLevelsFormArray = this.params.get("accessLevels") as FormArray;
  //   this.accessLevelsList.forEach(() =>
  //     accessLevelsFormArray.push(this.fb.control(false))
  //   );
  // }

  initializeAccessLevels() {
    const accessLevelsFormArray = this.params.get("accessLevels") as FormArray;
    this.accessLevelsList.forEach(() => accessLevelsFormArray.push(this.fb.control(false)));
  }
  
  fetchSections() {
    // this.http.get("http://localhost/OPDClinic/read/tbl_section").subscribe(
      this.apiService.get("read/tbl_section").subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.sectionsList = response.data.filter(
            (section: any) => section.is_deleted === "N"
          ); // Filter active sections
          if (this.sectionsList.length > 0) {
            this.params.patchValue({ section: this.sectionsList[0].id });
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
  fetchDataes() {
    this.http
    this.apiService.get("getempy/tbl_register").subscribe(
      // .get("http://localhost/OPDClinic/getempy/tbl_register").subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.contactList = response.data;
            this.searchContacts();

            this.fetchSections(); // Fetch sections on component initialization
            this.fetchDataes();
            this.fetchAccessLevels();
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
      // console.log(user);
      this.params.patchValue({
        id: user.id,
        name: user.name,
        section: user.section,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        resume: user.resume, // Still store the file name here
        role: user.role,  // role is patched here
        userType: user.userType,
        accessLevels: user.accessLevels,
        // joiningDate: user.joiningDate,
        joiningDate: user.joining_date
          ? new Date(user.joining_date).toISOString().split("T")[0]
          : null,

        password: '',
      });
      this.onRoleChange(user.role); // Ensure the role change updates the access levels

      // Check if the user has an existing resume and add the full path for display
      // this.previousResumeUrl = user.resume? `http://localhost/OPDClinic/public/assets/resume/${user.resume}`: null;
      const baseUrl = this.apiService.getBaseUrl();
      this.previousResumeUrl = user.resume? `${baseUrl}/public/assets/resume/${user.resume}`: null;
      // Populate access level checkboxes based on the user data
      const accessLevels = JSON.parse(user.access_levels);
      const accessLevelsFormArray = this.params.get(
        "accessLevels"
      ) as FormArray;
      this.accessLevelsList.forEach((level, index) => {
        accessLevelsFormArray
          .at(index)
          .setValue(accessLevels.includes(level.id));
      });
    }
  }

  // onFileChange(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.resumeFile = input.files[0]; // Save the selected file
  //   } else {
  //     this.resumeFile = null;
  //   }
  // }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.resumeFile = input.files[0];
      this.currentFileName = this.resumeFile.name; // Update to new file name
    }
  }

  saveUser() {
    if (this.params.invalid) {
      if (this.params.get('password')?.invalid) {
       alert('Password is required ')
      }
      // Optionally mark all fields as touched to display all errors
      this.params.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formData = new FormData();
    formData.append("id", this.params.get("id")?.value);
    formData.append("name", this.params.get("name")?.value);
    formData.append("section", this.params.get("section")?.value);
    formData.append("mobile", this.params.get("mobile")?.value);
    formData.append("email", this.params.get("email")?.value);
    formData.append("address", this.params.get("address")?.value);
    formData.append("password", this.params.get("password")?.value);
    formData.append("joiningDate", this.params.get("joiningDate")?.value);
    formData.append("role", this.params.get("role")?.value);
    formData.append("userType", this.params.get("userType")?.value);

    // Add the resume file if available, otherwise append a placeholder
    if (this.resumeFile) {
      formData.append("resume", this.resumeFile);
    } else {
      formData.append("resume", "existing"); // Placeholder to indicate no change
    }

    const selectedAccessLevelIds = this.params.value.accessLevels
      .map((checked: boolean, i: number) =>
        checked ? this.accessLevelsList[i].id : null
      )
      .filter((id: number | null) => id !== null);

    formData.append("accessLevels", JSON.stringify(selectedAccessLevelIds));
    const baseUrl = this.apiService.getBaseUrl();

    // const apiUrl = this.params.get("id")?.value
    //   ? `http://localhost/OPDClinic/createemp/tbl_register/${this.params.get("id")?.value}`
    //   : "http://localhost/OPDClinic/createemp/tbl_register";

    // // Handle post request for add or update
    // this.http.post(apiUrl, formData).subscribe(
      const endpoint = this.params.get("id")?.value
      ? `createemp/tbl_register/${this.params.get("id")?.value}`
      : `createemp/tbl_register`;
    this.apiService.post(endpoint, formData).subscribe(
      (response) => {
        this.isLoading = false;
        this.fetchSections(); // Fetch sections on component initialization
        this.fetchDataes();
        this.fetchAccessLevels();
        this.showMessage(
          this.params.get("id")?.value
            ? "Data has been updated successfully."
            : "Data has been added successfully."
        );
        this.addContactModal.close();
        this.fetchDataes();
      },
      (error) => {
        this.isLoading = false;
        this.showMessage(
          this.params.get("id")?.value
            ? "Error updating data."
            : "Error creating data.",
          "error"
        );
      }
    );
  }

  deleteUser(formData: any) {
    this.apiService.post(`delete/tbl_register/${formData.id}`, {}).subscribe(
    // this.http.post(`http://localhost/OPDClinic/delete/tbl_register/${formData.id}`,{}).subscribe(
        (response) => {
          console.log("Delete response:", response);
          this.contactList = this.contactList.filter(
            (d) => d.id !== formData.id
          );
          this.fetchSections(); // Fetch sections on component initialization
          this.fetchDataes();
          this.fetchAccessLevels();
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
