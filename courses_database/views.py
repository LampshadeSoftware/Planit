from django.shortcuts import render
from .models import Section

def index(request):
	unique_sections = set()
	sections = []
	for section in Section.objects.all():
		subject, course_id = section.subject, section.course_id
		if subject + course_id not in unique_sections:
			sections.append(section)
			unique_sections.add(subject + course_id)
			
	return render(request, 'index.html', {"sections": sections})