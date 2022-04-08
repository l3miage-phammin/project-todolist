import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export interface History<T> {
  canUndo: boolean;
  canRedo: boolean;
  history: T[];
  currentIndex: number;
  current: T;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService<T> {
  private before :T[] = [];
  private after :T[] = [];
  private subj?: BehaviorSubject<History<T>>;
  private observable: any;
  current! : T;
  constructor() {}


  getObservable(): Observable<History<T>>{
    return this.observable
  }

  initObservable(current: T): Observable<History<T>>{
    this.before = [];
    this.after = [];
    this.current = current;
    this.subj =  new BehaviorSubject<History<T>>({
      canUndo: false,
      canRedo: false,
      history: [current],
      currentIndex: 0,
      current: current
    });
    this.observable =  this.subj.asObservable();
    return this.observable;
  }

  push(elem: T){
    this.before.push(this.current);
    this.current = elem;
    this.after = []

    this.subj?.next({
      canUndo: true,
      canRedo: false,
      history: [...this.before,elem, ...this.after],
      currentIndex: this.before.length,
      current: elem
    })

  }

  undo(): T{
    this.after.push(this.current);
    const last = this.before.pop();
    if (last){
      this.current = last;
    }
    this.subj?.next({
      canUndo: this.before.length > 0,
      canRedo: true,
      history: [...this.before,this.current, ...this.after],
      currentIndex: this.before.length,
      current: this.current
    })
    return this.current
  }


  redo(): T{
    this.before.push(this.current);
    const last = this.after.pop();
    if (last){
      this.current = last;
    }
    this.subj?.next({
      canUndo: true,
      canRedo: this.after.length>0,
      history: [...this.before,this.current, ...this.after],
      currentIndex: 0,
      current: this.current
    })
    return this.current
  }
}
