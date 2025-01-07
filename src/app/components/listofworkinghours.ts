import { Component, ViewChild } from '@angular/core';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import Swal from 'sweetalert2';

@Component({
    templateUrl: './listofworkinghours.html',
})
export class ListofworkinghoursComponent {
    codeArr: any = [];
    toggleCode = (name: string) => {
        if (this.codeArr.includes(name)) {
            this.codeArr = this.codeArr.filter((d: string) => d != name);
        } else {
            this.codeArr.push(name);
        }
    };

    tab1: string = 'monday';
    tab2: string = 'monday';
    tab3: string = 'monday';
    tab4: string = 'monday';
    tab5: string = 'monday';
    tab6: string = 'monday';
    tab7: string = 'monday';
    tab8: string = 'monday';
    tab9: string = 'monday';
    tab10: string = 'monday';
    tab11: string = 'monday';
    tab12: string = 'monday';
    tab13: string = 'monday';
    tab14: string = 'monday';
    tab15: string = 'monday';
    tab16: string = 'monday';
    tab17: string = 'monday';
    tab18: string = 'monday';
    tab19: string = 'monday';
    tab20: string = 'monday';
    tab21: string = 'monday';
    tab22: string = 'monday';

    constructor() {}

    params = {
        id: null,
        title: '',
        slotStatus: 'active',  // Default slot status is 'active'
    };
    
    paramsTask = {
        projectId: null,
        id: null,
        title: '',
      
        date: '', // Added date field
        slotStatus: 'active', // New property to track the slot status
    };

    selectedTask: any = null;

    @ViewChild('isAddProjectModal') isAddProjectModal!: NgxCustomModalComponent;
    @ViewChild('isAddTaskModal') isAddTaskModal!: NgxCustomModalComponent;
    @ViewChild('isDeleteModal') isDeleteModal!: NgxCustomModalComponent;

    projectList: any = [
        {
            id: 1,
            title: 'Pending',
            tasks: [
                {
                    projectId: 2,
                    id: 2.1,
                    title: 'Plan a trip to another country',
                    date: '10 Sep, 2020',
                },
            ],
        },

        {
            id: 2,
            title: 'Pending',
            tasks: [
                {
                    projectId: 3,
                    id: 2.1,
                    title: 'Plan a trip to another country',
            
                    date: '11 Sep, 2020',
                },
            ],
        },
    ];

    addEditProject(project: any = null) {
        setTimeout(() => {
            this.params = {
                id: null,
                title: '',
                slotStatus: 'active', // Ensure the default slotStatus is always set
            };
            if (project) {
                this.params = JSON.parse(JSON.stringify(project));
                // Ensure slotStatus is correctly copied if project exists
                this.params.slotStatus = this.params.slotStatus || 'active';  // Fallback to 'active' if missing
            }
            this.isAddProjectModal.open();
        });
    }
    
    saveProject() {
        if (!this.params.title) {
            this.showMessage('Title is required.', 'error');
            return;
        }
    
        if (this.params.id) {
            // Update project
            const project = this.projectList.find((d: any) => d.id === this.params.id);
            project.title = this.params.title;
            project.slotStatus = this.params.slotStatus;  // Ensure slotStatus is updated
        } else {
            // Add project
            const lastId = this.projectList.length
                ? this.projectList.reduce((max: number, obj: any) => (obj.id > max ? obj.id : max), this.projectList[0].id)
                : 0;
    
            const project = {
                id: lastId + 1,
                title: this.params.title,
                tasks: [],
                slotStatus: this.params.slotStatus,  // Save the selected slotStatus
            };
            this.projectList.push(project);
        }
    
        this.showMessage('Slot has been saved successfully.');
        this.isAddProjectModal.close();
    }
    

    deleteProject(project: any) {
        this.projectList = this.projectList.filter((d: any) => d.id != project.id);
        this.showMessage('Slot has been deleted successfully.');
    }

    clearProjects(project: any) {
        project.tasks = [];
    }

    // Task management
addEditTask(projectId: any, task: any = null) {
    this.paramsTask = {
        projectId: null,
        id: null,
        title: '',

        date: '',
        slotStatus: 'active', // Default slotStatus is set here as well
    };

    if (task) {
        this.paramsTask = JSON.parse(JSON.stringify(task));
        this.paramsTask.slotStatus = this.paramsTask.slotStatus || 'active'; // Ensure slotStatus is available
    }

    this.paramsTask.projectId = projectId;
    this.isAddTaskModal.open();
}


    saveTask() {
        if (!this.paramsTask.title) {
            this.showMessage('Title is required.', 'error');
            return;
        }
    
        if (!this.paramsTask.date) {
            this.showMessage('Date is required.', 'error');
            return;
        }
    
        const project = this.projectList.find((d: any) => d.id === this.paramsTask.projectId);
    
        if (this.paramsTask.id) {
            // Update task
            const task = project.tasks.find((d: any) => d.id === this.paramsTask.id);
            task.title = this.paramsTask.title;
          
            task.date = this.paramsTask.date;
            task.slotStatus = this.paramsTask.slotStatus;  // Ensure slotStatus is updated
        } else {
            // Add new task
            let maxid = 0;
            if (project.tasks?.length) {
                maxid = project.tasks.reduce((max: number, obj: any) => (obj.id > max ? obj.id : max), project.tasks[0].id);
            }
    
            const task = {
                projectId: this.paramsTask.projectId,
                id: maxid + 0.1,
                title: this.paramsTask.title,
                date: this.paramsTask.date,
                slotStatus: this.paramsTask.slotStatus,  // Save the slotStatus property
            };
    
            project.tasks.push(task);
        }
    
        this.showMessage('Slot has been saved successfully.');
        this.isAddTaskModal.close();
    }
    

    deleteConfirmModal(projectId: any, task: any = null) {
        this.selectedTask = task;
        setTimeout(() => {
            this.isDeleteModal.open();
        }, 10);
    }

    deleteTask() {
        let project = this.projectList.find((d: any) => d.tasks.find((t: any) => t.id === this.selectedTask.id));
        project.tasks = project.tasks.filter((d: any) => d.id != this.selectedTask.id);

        this.showMessage('Slot has been deleted successfully.');
        this.isDeleteModal.close();
    }

    showMessage(msg = '', type = 'success') {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    }
}
