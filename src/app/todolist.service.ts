import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, first, Observable, of, Subscription, take } from 'rxjs';
import { History, HistoryService } from './history.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';

export interface TodoItem {
  readonly label: string;
  readonly isDone: boolean;
  readonly id: number;
}

export interface TodoList {
  readonly label: string;
  readonly items: readonly TodoItem[];
}

let idItem = 0;
const KEY_NAME = 'L3';
const DEFAULT: TodoList = {
  label:'',
  items: []
}
@Injectable({
  providedIn: 'root',
})
export class TodolistService {
  private subjectFilter = new BehaviorSubject<string>('all');

  private readonly observableFilter = this.subjectFilter.asObservable();
  private currentHistory?: History<TodoList>;
  private itemDoc!: AngularFirestoreDocument<TodoList>;
  afItems!: Observable<any>;
  subs: any
  todoList: TodoList = DEFAULT;
  constructor(
    private readonly history: HistoryService<TodoList>,
    private afs: AngularFirestore
  ) {
  }

  findUserDatabase(uid: string){

    this.itemDoc = this.afs.doc<TodoList>(`items/${uid}`);
    this.afItems = this.itemDoc.valueChanges();

    this.itemDoc.get().subscribe((data)=>{
      if (!data.exists){
        this.itemDoc.set(DEFAULT);
      }

    this.subs = new Subscription();
    this.subs.add(this.afItems?.subscribe((todoList) => {
      this.todoList = todoList;
      // Id new items starts from the biggest
      idItem = this.todoList?.items.reduce((a,b)=>Math.max(a,b.id),0)+ 1;
      
    }));

    /// initialize local history from the first value emitted from the database
    this.afItems?.pipe(take(1)).subscribe((firstTodoList)=>{
      this.subs.add(this.history.initObservable(firstTodoList).subscribe((history) => {
        this.currentHistory =history
      }))
    })
    })
    

  }
  
  /* get observable of todoList */
  getListObservable() {
    return this.afItems;
  }

  /* get observable of filter */
  getFilterObservable() {
    return this.observableFilter;
  }

  /* get local todoList */
  getLocalTodo():void {
    let object = localStorage.getItem(KEY_NAME);

    if (object) {
      const list = JSON.parse(object || '');
      this.itemDoc.update(list);
      this.history.push(list);
    }
    else {
      window.alert("there is no local storage");
    }
  }
  /* Update local storage */
  updateLocalStorage(): void {
    localStorage.setItem(KEY_NAME, JSON.stringify(this.todoList));
  }

  create(...labels: readonly string[]): this {
    const L: TodoList = this.todoList;
    const newList = {
      ...L,
      items: [
        ...L.items,
        ...labels
          .filter((l) => l !== '')
          .map((label) => ({ label, isDone: false, id: idItem++ })),
      ],
    };
    this.itemDoc.update(newList);
    this.history.push(newList);

    return this;
  }

  delete(...items: readonly TodoItem[]): this {
    const L = this.todoList;
    const newList = {
      ...L,
      items: L.items.filter((item) =>!items.some((e)=>e.id === item.id)),
    };
    this.itemDoc.update(newList);
    this.history.push(newList);

    return this;
  }

  update(data: Partial<TodoItem>, ...items: readonly TodoItem[]): this {
    if (data.label !== '') {
      const L = this.todoList;
      const newList = {
        ...L,
        items: L.items.map((item) =>
          items.some((e)=>e.id===item.id)? { ...item, ...data } : item
        ),
      };
      this.itemDoc.update(newList);
      this.history.push(newList);
    } else {
      this.delete(...items);
    }
    return this;
  }

  updateFilter(filter: string) {
    this.subjectFilter.next(filter);
  }

  undo() {
    if (this.currentHistory?.canUndo) {
      const newList = this.history.undo();
      this.itemDoc.update(newList);
    } else {
      window.alert('cannot undo');
    }
  }

  redo() {
    if (this.currentHistory?.canRedo) {
      const newList = this.history.redo();
      this.itemDoc.update(newList);
    } else {
      window.alert('cannot redo');
    }
  }
}
