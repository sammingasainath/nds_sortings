interface ParameterInfo {
  [key: string]: {
    description: string;
    weight?: string;
    category?: string;
    formula?: string;
    fullName?: string;
  };
}

export const parameterInfo: ParameterInfo = {
  "SS": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Student Strength including Doctoral Students: Evaluates the total number of students at different levels. Calculated using total sanctioned intake (NT), enrolled students (NE), and doctoral students (NP).",
    weight: "20",
    formula: "SS = f(NT, NE) × 15 + f(NP) × 5",
    fullName: "Student Strength"
  },
  "FSR": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Faculty-Student Ratio: Measures the ratio between permanent faculty members and enrolled students to ensure effective teaching and learning quality.",
    weight: "30",
    fullName: "Faculty-Student Ratio"
  },
  "FQE": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Faculty Qualification & Experience: Assesses faculty members' qualifications (PhD or equivalent) and experience, giving equal weight to both academic credentials and practical experience.",
    weight: "15",
    fullName: "Faculty Qualification & Experience"
  },
  "FRU": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Financial Resources Utilization: Evaluates the institution's financial health and effectiveness in utilizing available resources for academic and infrastructure development.",
    weight: "5",
    fullName: "Financial Resources Utilization"
  },
  "PU": {
    category: "Research and Professional Practice (RP)",
    description: "Publications: Assesses the quantity and quality of research publications, including factors like citation impact and publication volume.",
    weight: "10",
    fullName: "Publications"
  },
  "QP": {
    category: "Research and Professional Practice (RP)",
    description: "Quality of Publications: Evaluates the impact of research through citation metrics and publication quality indicators.",
    weight: "15",
    fullName: "Quality of Publications"
  },
  "IPR": {
    category: "Research and Professional Practice (RP)",
    description: "Intellectual Property Rights: Measures intellectual property generation through patents, copyrights, and designs. Considers both published and granted patents.",
    weight: "10",
    fullName: "Intellectual Property Rights"
  },
  "FPPP": {
    category: "Research and Professional Practice (RP)",
    description: "Footprint of Projects & Professional Practice: Evaluates the institution's engagement in research projects, professional practices, and executive development initiatives.",
    weight: "10",
    fullName: "Footprint of Projects & Professional Practice"
  },
  "GPH": {
    category: "Graduation Outcomes (GO)",
    description: "Graduation Placement & Higher Studies: Measures the success rate of students in securing placements or pursuing higher education after graduation.",
    weight: "15",
    fullName: "Graduation Placement & Higher Studies"
  },
  "GUE": {
    category: "Graduation Outcomes (GO)",
    description: "Graduation University Examinations: Evaluates student performance in university examinations and academic assessments.",
    weight: "10",
    fullName: "Graduation University Examinations"
  },
  "MS": {
    category: "Graduation Outcomes (GO)",
    description: "Median Salary: Considers the median salary of graduating students as an indicator of employment quality.",
    weight: "10",
    fullName: "Median Salary"
  },
  "GPHD": {
    category: "Graduation Outcomes (GO)",
    description: "Graduating PhD Students: Assesses the institution's contribution to doctoral education.",
    weight: "10",
    fullName: "Graduating PhD Students"
  },
  "RD": {
    category: "Outreach and Inclusivity (OI)",
    description: "Regional Diversity: Measures the institution's success in attracting students from diverse regional and national backgrounds.",
    weight: "10",
    fullName: "Regional Diversity"
  },
  "WD": {
    category: "Outreach and Inclusivity (OI)",
    description: "Women Diversity: Assesses the representation and support for women among students and faculty.",
    weight: "10",
    fullName: "Women Diversity"
  },
  "ESCS": {
    category: "Outreach and Inclusivity (OI)",
    description: "Economically & Socially Challenged Students: Evaluates the institution's efforts in including and supporting students from disadvantaged backgrounds.",
    weight: "10",
    fullName: "Economically & Socially Challenged Students"
  },
  "PCS": {
    category: "Outreach and Inclusivity (OI)",
    description: "Physically Challenged Students: Assesses the infrastructure and support systems available for physically challenged students.",
    weight: "10",
    fullName: "Physically Challenged Students"
  },
  "PR": {
    category: "Perception (PR)",
    description: "Perception Ranking: Measures the institution's reputation among academic peers, employers, and other stakeholders.",
    weight: "10",
    fullName: "Perception Ranking"
  }
}; 