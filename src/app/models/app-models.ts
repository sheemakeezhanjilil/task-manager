//decalre all class models here

export class TaskElement {
    public summary?: string;
    public link?: string;
    public status?: string;
    public dueDate?: Date;
    public editable: boolean

    constructor(task?: TaskElement) {
        this.summary = task && task?.summary || '';
        this.link = task && task?.link || '';
        this.status = task && task?.status || '';
        this.dueDate = task && task?.dueDate || new Date();
        this.editable = task && task?.editable || true;
      }
  }
  