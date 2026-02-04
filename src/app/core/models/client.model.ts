export interface ClientResponse {
  id: number;
  name: string;
  last_name: string;
  document_type: 'DNI' | 'RUC';
  document: string;
  address: string;
  cellphome: string;
  email: string;
  gender: string;
  birthday: string;
  photo: string;
}

export interface ClientRequest {
  name: string;
  last_name: string;
  document_type: 'DNI' | 'RUC';
  document: string;
  address: string;
  cellphome: string;
  email: string;
  gender: string;
  birthday: string;
  photo: File;
}
