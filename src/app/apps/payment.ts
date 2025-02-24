import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { ApiService } from 'src/app/api.service'; // Import your API service

@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
})
export class PaymentComponent implements OnInit {
  planForm: FormGroup;
  displayType = "list";
  contactList: any = [];
  productKeyUserId: number = 8; // Assuming this ID is coming from the URL or elsewhere

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.planForm = this.fb.group({
      companyname: [{ value: '', disabled: true }, [Validators.required]],
      lastPlan: [{ value: '', disabled: true }, [Validators.required]],
      amountForMonth: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[0-9]*$')]],
      planStartFrom: [{ value: '', disabled: true }, [Validators.required]],
      planMonth: [null, [Validators.required]],
      amountAccordingToPlan: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.fetchClinics();
  }

  fetchClinics(): void {
    console.log("Trying to fetch data...");
    const endpoint = `read/tbl_opdproductkey/${this.productKeyUserId}`;
    const requestBody = {
      clinicname: this.productKeyUserId,
    };
  
    this.apiService.post(endpoint, requestBody).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.contactList = response.data;
          console.log('Clinic data:', this.contactList);
  
          // Ensure we call populateForm with the first clinic data (or modify for multiple)
          if (this.contactList && this.contactList.length > 0) {
            this.populateForm(this.contactList[0]);
          }
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
  


  populateForm(clinicData: any) {
    // Parse the `lastPlan` date
    const lastPlanDate = new Date(clinicData.subscribtion_enddate);
  
    // Calculate the next day's date
    const nextDay = new Date(lastPlanDate);
    nextDay.setDate(lastPlanDate.getDate() + 1);
  
    // Format the date to `YYYY-MM-DD` for the date input field
    const formatDate = (date: Date) =>
      date.toISOString().split('T')[0];
  
    // Patch form values
    this.planForm.patchValue({
      companyname: clinicData.clinicname,
      lastPlan: formatDate(lastPlanDate), // Set `lastPlan`
      amountForMonth: clinicData.Subscription_fee || 0,
      planStartFrom: formatDate(nextDay), // Set `planStartFrom` to the next day
      planMonth: null,
      amountAccordingToPlan: clinicData.Subscription_fee || 0,
    });
  
    // Disable the `planStartFrom` field to make it non-editable
    this.planForm.get('planStartFrom')?.disable();
  }
  
  
  calculateAmount() {
    const amountForMonth = this.planForm.get('amountForMonth')?.value;
    const planMonth = this.planForm.get('planMonth')?.value;

    if (amountForMonth && planMonth) {
      const calculatedAmount = amountForMonth * planMonth;
      this.planForm.get('amountAccordingToPlan')?.setValue(calculatedAmount);
    }
  }

  payNow() {
    // Add logic for payment processing
    console.log('Payment processing...');
  }

  showMessage(message: string, type: string) {
    // Handle message display (error or success)
    console.log(`${type}: ${message}`);
  }
}
