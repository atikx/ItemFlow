export interface Event {
  __typename?: string;
  id: string;
  name: string;
  year: number;
}

export interface EventFormData {
  name: string;
  year: string;
}

export interface CreateEventInput {
  name: string;
  year: number;
}

export interface GroupedEvents {
  [year: number]: Event[];
}
