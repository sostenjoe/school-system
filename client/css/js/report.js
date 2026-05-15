async function loadReports(){

const response = await fetch(
"/api/results"
);

const data = await response.json();

const grouped = {};

data.forEach(result => {

if(!grouped[result.student_name]){

grouped[result.student_name] = {
total:0,
count:0
};

}

grouped[result.student_name].total +=
Number(result.marks);

grouped[result.student_name].count += 1;

});

let students = [];

for(let student in grouped){

const total =
grouped[student].total;

const count =
grouped[student].count;

const average =
(total / count).toFixed(2);

let grade = "F";

if(average >= 80){
grade = "A";
}else if(average >= 60){
grade = "B";
}else if(average >= 40){
grade = "C";
}else if(average >= 20){
grade = "D";
}

students.push({
student,
count,
average,
grade
});

}

students.sort(
(a,b)=>b.average-a.average
);

const table =
document.getElementById(
"reportTable"
);

students.forEach((s,index)=>{

table.innerHTML += `
<tr>
<td>${s.student}</td>
<td>${s.count}</td>
<td>${s.average}</td>
<td>${s.grade}</td>
<td>${index + 1}</td>
</tr>
`;

});

}

loadReports();