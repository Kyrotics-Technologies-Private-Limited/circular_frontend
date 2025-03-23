// export interface Organization {
//     id: string;
//     name: string;
//     description: string;
//     members: string[];
//     admins: string[];
//     createdBy: string;
//     createdAt: Date;
//     updatedAt: Date;
//   }



export interface Organization {
  id: string;
  description: string;
  name: string;
  CIN: string;  // Company Identification Number
  status: 'pending' | 'approved' | 'rejected';
  ownerUid: string;
  createdAt: Date;
  updatedAt: Date;

}