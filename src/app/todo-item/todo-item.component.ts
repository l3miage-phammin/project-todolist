import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { TodoItem } from '../todolist.service';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent implements OnInit {
  @Input() todoItem!: TodoItem;
  @Output() updateEvent = new EventEmitter<Partial<TodoItem>>();
  @Output() removeEvent = new EventEmitter<void>();
  isEditing = false;
  label!: string;

  @ViewChild('newTextInput') newTextInput!: ElementRef<HTMLInputElement>;

  @HostListener('document:click', ['$event.target'])
  public onPageClick(targetElement: any) {
    const clickedInside = this.ref.nativeElement.contains(targetElement);
    if (!clickedInside && this.isEditing) {
      this.editLabel();
    }
  }
  constructor(private ref: ElementRef) {}
  ngOnInit(): void {
    this.label = this.todoItem.label;
  }

  updateItem(changes: Partial<TodoItem>) {
    this.updateEvent.emit(changes);
  }

  updateStatus(value: boolean) {
    this.updateItem({ isDone: value });
  }

  deleteItem() {
    this.removeEvent.emit();
  }
  editLabel() {
    this.updateItem({ label: this.label });
    this.isEditing = false;
  }

  openEdit() {
    this.isEditing = true;
    requestAnimationFrame(() => this.newTextInput.nativeElement.focus());
  }
}
