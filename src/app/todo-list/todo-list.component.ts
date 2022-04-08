import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  HostListener,
  OnDestroy
} from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { filterActive, filterALL, filterCompleted } from '../filter';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

export type FctFilter = (item: TodoItem) => boolean;

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent implements OnInit, OnDestroy {
  @ViewChildren('refItem') set itemComponents(list:QueryList<TodoItem>){
    this.updateListItemComponents(list)
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.control.z') undoEvent(event: KeyboardEvent) { 
    this.undo();
  } 
  
   
  constructor(
    readonly todoListService: TodolistService,
    private cdr: ChangeDetectorRef,
    private readonly auth: AuthService
  ) {}
  label = '';
  allMarked: boolean = true;
  todoList?: TodoList;
  restant = 0;
  length = 0;
  listItems: TodoItem[] =[];
  listItemComponents: any = [];
  filter = '';
  sub: any;
  ngOnInit(): void {
    this.sub = combineLatest([this.todoListService.getListObservable()!,this.todoListService.getFilterObservable()]).subscribe(
      ([todoList, filter])=>{
        // get the same reference list with the one in the service
        this.todoList = todoList
        this.length = todoList.items.length;
        this.restant = this.length;
        this.todoList?.items.forEach((elem) => {
          if (elem.isDone) {
            this.restant = this.restant - 1;
          }
        });
  
        this.allMarked = this.restant === 0;

      this.filterList(filter);
      }
    );
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  addTodo() {
    this.todoListService.create(this.label);
    this.label = '';
  }
  trackByIdx(index: number, obj: any): any {
    return index;
  }

  markAndUnmark() {
    this.allMarked = !this.allMarked;
    let itemsToChange: TodoItem[] =
      this.todoList?.items.filter(
        (element) => element.isDone !== this.allMarked
      ) || [];
    this.todoListService.update({ isDone: this.allMarked }, ...itemsToChange);
  }

  unmarkAll() {
    let itemsToChange: TodoItem[] =
      this.todoList?.items.filter((element) => element.isDone) || [];

    this.todoListService.update({ isDone: false }, ...itemsToChange);
  }
  somethingIsDone() {
    return this.restant < this.length;
  }

  updateItem(update: Partial<TodoItem>, item: TodoItem) {
    this.todoListService.update(update, item);
  }

  deleteItem(item: TodoItem) {
    this.todoListService.delete(item);
  }

  getIsEditing(index: number) {
    if (this.listItemComponents){
      return this.listItemComponents[index]?.isEditing || false;
    }
    return false
  }

  changeFilter(filter: string){
    if (filter !== this.filter){
      this.todoListService.updateFilter(filter);
    }
  }

  trackById(index: number, item: TodoItem): number {

    return item.id;

  }

  undo(){
    this.todoListService.undo();
  }

  redo(){
    this.todoListService.redo();
    
  }
  private updateListItemComponents(list:QueryList<TodoItem>) {
    this.listItemComponents = list?.toArray();
  }
  private filterList(filter: string){
    this.filter = filter
    switch (filter) {
      case 'all':
        this.listItems = this.todoList?.items.filter(filterALL) || [];
        break;
    
      case 'active':
        this.listItems = this.todoList?.items.filter(filterActive) || [];
      
        break;
      default:
        this.listItems = this.todoList?.items.filter(filterCompleted) || [];

        break;
    }
  }
}
