import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'studentFilter',
  standalone: true
})
export class StudentFilterPipe implements PipeTransform {
  transform(students: any[], searchTerm: string, status: string): any[] {
    if (!students) return [];
    
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.class.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = !status || status === 'All' || student.feeStatus === status;
      
      return matchesSearch && matchesStatus;
    });
  }
}