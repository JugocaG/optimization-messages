import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { CampaignService } from '../../services/campaign.service';
import { TreeDragDropService, TreeNode } from 'primeng/api';
import { response, Router } from 'express';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

interface DailyTask {
  id: number;
  op: string;
  task: string;
  comment: string;
  task_completed: boolean;
  order_task: number;
  titleTask: string;
  nameCampaign: string;
  dateTask: string | Date; // Puede ser string o Date, dependiendo de la conversión
}

@Component({
  selector: 'app-daily-checklist',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BaseChartDirective,
    ProgressBarModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    SelectButtonModule,
    CalendarModule,
    AccordionModule,
    CheckboxModule,
    ReactiveFormsModule,
    ToastModule,
    InplaceModule,
    InputTextareaModule,
    FloatLabelModule,
    ProgressSpinnerModule,
    TreeModule,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    MatSelectModule,
    MatFormFieldModule,
  ],
  providers: [TreeDragDropService],
  templateUrl: './daily-checklist.component.html',
  styleUrl: './daily-checklist.component.css',
})
export class DailyChecklistComponent {
  constructor(private campaignService: CampaignService) {}

  // Datos OPS y Sales

  statusCampaign: any[] = [
    { status: 'PREPARATION', source: 'assets/icons/letter-p.svg' },
    { status: 'EXECUTION', source: 'assets/icons/letter-e.svg' },
    { status: 'CLOSED', source: 'assets/icons/letter-c.svg' },
    { status: 'ARCHIVED', source: 'assets/icons/letter-a.svg' },
    { status: 'APPROVAL', source: 'assets/icons/letter-i.svg' },
    { status: 'DELETED', source: 'assets/icons/letter-d.svg' },
  ];

  listOPS: any[] = ['Estefany Bermudez', 'Alejandra Correa', 'Luisa Clavijo'];
  OpSelected: string = '';

  colors: string[] = ['#4CAF50', '#8BC34A', '#FFC107', '#F44336', '#D0D2D5'];
  colorSelected: string = '';

  listTitleDaily: any[] = [
    'Visibilidad a Cliente: 5 min',
    'Hablar con perfiles para ejecución',
    'Hablar con perfiles para ppt y/o cotización',
    'Entrega de propuestas y/o cotizaciones',
    'Reuniones del día',
    'Otros',
  ];

  time: Date[] | undefined;

  ngOnInit(): void {
    const nameOpFilterSelectedDaily = localStorage.getItem('OpDailySales');

    if (nameOpFilterSelectedDaily) {
      this.OpSelected = nameOpFilterSelectedDaily;
    } else {
      // Si no hay valor almacenado, puedes manejar un valor por defecto o un mensaje
      this.OpSelected = ''; // Por ejemplo, un nombre vacío
    }

    setTimeout(() => {
      this.getAllDailyTask();
      this.getAllCampaigns();
    }, 500);
  }

  saveAndCloseTask(inplace: any, dailyData: any) {
    this.campaignService.updateDaily(dailyData).subscribe(
      (response) => {
        console.log('Tasks updated successfully', response);
      },
      (error) => {
        console.error('Error updating tasks', error);
      }
    );

    inplace.deactivate();
  }

  deleteDaily(idDaily: any) {
    this.campaignService.deleteOpDaily(idDaily).subscribe(
      (response) => {
        console.log('Tasks updated successfully', response);
      },
      (error) => {
        console.error('Error deleting tasks', error);
      }
    );

    setTimeout(() => {
      this.getAllDailyTask();
    }, 200);
  }

  addDailyTask(name: string, op: string, task: string, comment: string) {
    const dailyData = {
      op: op,
      task: task,
      comment: comment,
      titleTask: this.titleOPS,
      nameCampaign: name,
    };

    this.campaignService.addDaily(dailyData).subscribe(
      (response) => {
        console.log('Tasks updated successfully', response);
      },
      (error) => {
        console.error('Error updating tasks', error);
      }
    );

    this.displayDialogNewTask = false;

    this.newItemHeader = '';
    this.newItemContent = '';

    setTimeout(() => {
      this.getAllDailyTask();
    }, 200);
  }

  titleOPS: string = '';

  // Daily OPS

  displayDialogNewTask: boolean = false;
  newItemHeader: string = '';
  newItemContent: string = '';
  nameCampaign: string = '';
  nameOp: string = '';

  showDialogNewTask(nameCampaign: string, nameOp: string) {
    this.nameCampaign = nameCampaign;
    this.nameOp = nameOp;
    this.displayDialogNewTask = true;
  }

  // Drop

  drop(event: CdkDragDrop<any[]>, title: string) {
    let indexTask: number = 0;
    let indexPreviousTask: number = 0;
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      for (const item of event.container.data) {
        for (const itemAll of this.allDailyTask) {
          if (item.id === itemAll.id) {
            itemAll.order_task = indexTask;
            indexTask++;
            break;
          }
        }
      }
      this.allDailyTask.sort((a, b) => a.order_task - b.order_task);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      for (const item of this.allDailyTask) {
        if (item.id === event.container.data[event.currentIndex].id) {
          if (this.allDailyTask[indexTask].nameCampaign != 'daily') {
            console.log('Pene');
            this.allDailyTask[indexTask].nameCampaign = title;
          } else {
            console.log(title);
            this.allDailyTask[indexTask].titleTask = title;
          }
          break; // Sale del bucle interno
        } else {
          indexTask++;
        }
      }

      for (const item of event.container.data) {
        for (const itemAll of this.allDailyTask) {
          if (item.id === itemAll.id) {
            itemAll.order_task = indexPreviousTask;
            indexPreviousTask++;
            break;
          }
        }
      }

      this.allDailyTask.sort((a, b) => a.order_task - b.order_task);
    }
    console.log(event);
    this.updateAllDaily(this.allDailyTask);
  }

  showDailySales() {
    window.open('daily-sales', '_self');
  }

  showDailyOps() {
    window.open('daily-checklist', '_self');
  }

  showCampaign() {
    window.open('campaign', '_self');
  }

  showWeeklyWorkload() {
    window.open('weekly-workloads', '_self');
  }

  showChatbot() {
    window.open('chatbot', '_self');
  }

  showCotizador() {
    window.open('home', '_self');
  }

  allDailyTask: any[] = [];
  getAllDailyTask() {
    this.campaignService.getAllDailyTask().subscribe(
      (response) => {
        this.allDailyTask = response.map((task: DailyTask) => {
          // Convertir dateTask a objeto Date si no lo es
          if (task.dateTask && !(task.dateTask instanceof Date)) {
            task.dateTask = new Date(task.dateTask);
          }
          return task;
        });

        // Ordenar las tareas por order_task
        this.allDailyTask.sort((a, b) => a.order_task - b.order_task);
      },
      (error) => {
        console.log('Error get DailyTask', error);
      }
    );
  }

  allCampaigns: any[] = [];
  getAllCampaigns() {
    this.campaignService.getAllCampaigns().subscribe(
      (response) => {
        this.allCampaigns = response;
      },
      (error) => {
        console.log('Error get Campaign', error);
      }
    );
  }

  getNameCampaignByNameOp(nameOp: string) {
    return this.allCampaigns
      .filter((item) => item.name_op === nameOp)
      .map((Item) => Item.name);
  }

  updateAllDaily(dailyData: any[]) {
    this.campaignService.updateAllDaily(dailyData).subscribe(
      (response) => {
        console.log('Tasks updated successfully', response);
      },
      (error) => {
        console.error('Error updating tasks', error);
      }
    );
  }

  getBrandByNameOp(nameOp: string): string[] {
    return Array.from(
      new Set(
        this.allCampaigns
          .filter(
            (item) =>
              item.name_op === nameOp &&
              item.campaign_state != 'ARCHIVED' &&
              item.campaign_state != 'DELETED' &&
              item.campaign_state != 'CLOSED'
          )
          .map((item) => item.brand)
      )
    );
  }

  getClientByNameOp(nameOp: string, brand: string): string[] {
    return Array.from(
      new Set(
        this.allCampaigns
          .filter(
            (item) =>
              item.name_op === nameOp &&
              item.brand == brand &&
              item.campaign_state != 'ARCHIVED' &&
              item.campaign_state != 'DELETED' &&
              item.campaign_state != 'CLOSED'
          )
          .map((item) => item.client)
      )
    );
  }

  getCampaignByNameOp(nameOp: string, brand: string, client: string): any[] {
    return this.allCampaigns.filter(
      (item) =>
        item.name_op === nameOp &&
        item.brand == brand &&
        item.client == client &&
        item.campaign_state != 'ARCHIVED' &&
        item.campaign_state != 'DELETED' &&
        item.campaign_state != 'CLOSED'
    );
  }

  getItemsByTitle(titleTask: string, nameOp: string) {
    return this.allDailyTask.filter(
      (item) =>
        item.op === nameOp &&
        item.titleTask === titleTask &&
        item.nameCampaign === 'daily'
    );
  }

  getItemsByCampaign(name: string, nameOp: string) {
    return this.allDailyTask.filter(
      (item) => item.nameCampaign === name && item.op === nameOp
    );
  }

  updateColorCampaign(data: any) {
    this.campaignService.updateColorCampaign(data).subscribe(
      (response) => {
        console.log('Color updated successfully', response);
      },
      (error) => {
        console.error('Color updating tasks', error);
      }
    );
  }

  updateTime(data: any) {
    console.log(this.time);
    this.campaignService.updateTimeTask(data).subscribe(
      (response) => {
        console.log('Color updated successfully', response);
      },
      (error) => {
        console.error('Color updating tasks', error);
      }
    );
  }

  changeOpFilter() {
    localStorage.setItem('OpDailySales', this.OpSelected);
  }
}
