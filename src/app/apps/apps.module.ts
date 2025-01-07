import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

// shared module
import { SharedModule } from "src/shared.module";

import { ScrumboardComponent } from "./scrumboard";
import { BranchComponent } from "./branch";
import { hwservicesComponent } from "./hwservices";
import { HolidayComponent } from "./holiday";
import { LabTestComponent } from "./labtest";
import { RadiologyTestComponent } from "./radiologytest";
import { EmployeeComponent } from "./employee";
import { MenuComponent } from "./menu";

import { ConsultantScheduleComponent } from './consultantschedule';
import { AddclinicComponent } from "./addclinic";



import { ContactsComponent } from "./contacts";
import { ConsultantsComponent } from "./consultants";
import { ScheduleComponent } from "./Schedule";

import { NotesComponent } from "./notes";
import { TodolistComponent } from "./todolist";
import { InvoicePreviewComponent } from "./invoice/preview";
import { InvoiceAddComponent } from "./invoice/add";
import { InvoiceEditComponent } from "./invoice/edit";
import { CalendarComponent } from "./calendar";
import { ChatComponent } from "./chat";
import { MailboxComponent } from "./mailbox";
import { InvoiceListComponent } from "./invoice/list";


const routes: Routes = [
  { path: "apps/chat", component: ChatComponent, data: { title: "Chat" } },
  {
    path: "apps/mailbox",
    component: MailboxComponent,
    data: { title: "Mailbox" },
  },
  {
    path: "apps/scrumboard",
    component: ScrumboardComponent,
    data: { title: "Scrumboard" },
  },
  {
    path: "apps/Branch",
    component: BranchComponent,
    data: { title: "Branch" },
  },
  {
    path: "apps/addclinic",
    component: AddclinicComponent,
    data: { title: "addclinic" },
  },
  {
    path: "apps/Health-and-Wellness-Services",
    component: hwservicesComponent,
    data: { title: "Health & Wellness Services" },
  },
  {
    path: "apps/Holiday",
    component: HolidayComponent,
    data: { title: "Holiday" },
  },
  {
    path: "apps/LabTest",
    component: LabTestComponent,
    data: { title: "LabTest" },
  },
  {
    path: "apps/RadiologyTest", 
    component: RadiologyTestComponent, 
    data: { title: "RadiologyTest" },
  },
  {
    path: "apps/contacts",
    component: ContactsComponent,
    data: { title: "Contacts" },
  },

  {
    path: "apps/Consultants",
    component: ConsultantsComponent,
    data: { title: "Consultants" },
  },

  {
    path: "apps/Schedule",
    component: ScheduleComponent,
    data: { title: "Schedule" },
  },
  {
    path: "apps/consultantschedule",
    component: ConsultantScheduleComponent,
    data: { title: "CSchedule" },
  },

  {
    path: "apps/Employee",
    component: EmployeeComponent,
    data: { title: "Employee" },
  },

  {
    path: "apps/Menu",
    component: MenuComponent,
    data: { title: "Menu" },
  },

  { path: "apps/notes", component: NotesComponent, data: { title: "Notes" } },
  {
    path: "apps/todolist",
    component: TodolistComponent,
    data: { title: "Todolist" },
  },
  {
    path: "apps/invoice/list",
    component: InvoiceListComponent,
    data: { title: "Invoice List" },
  },
  {
    path: "apps/invoice/preview",
    component: InvoicePreviewComponent,
    data: { title: "Invoice Preview" },
  },
  {
    path: "apps/invoice/add",
    component: InvoiceAddComponent,
    data: { title: "Invoice Add" },
  },
  {
    path: "apps/invoice/edit",
    component: InvoiceEditComponent,
    data: { title: "Invoice Edit" },
  },
  {
    path: "apps/calendar",
    component: CalendarComponent,
    data: { title: "Calendar" },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule.forRoot(),
  ],
  declarations: [
    ChatComponent,
    ScrumboardComponent,
    BranchComponent,
    AddclinicComponent,
    hwservicesComponent,
    HolidayComponent,
    LabTestComponent,
    RadiologyTestComponent,
    ContactsComponent,
    ConsultantsComponent,
    ScheduleComponent,
    NotesComponent,
    TodolistComponent,
    InvoiceListComponent,
    InvoicePreviewComponent,
    InvoiceAddComponent,
    InvoiceEditComponent,
    CalendarComponent,
    MailboxComponent,
    EmployeeComponent,
    MenuComponent,

  ],
})
export class AppsModule {}
