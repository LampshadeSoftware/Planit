from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from .models import Section
import API.Interface as Interface
import json


def index(request):
	unique_sections = set()
	sections = []
	for section in Section.objects.all():
		subject, course_id = section.subject, section.course_id
		if subject + course_id not in unique_sections:
			sections.append(section)
			unique_sections.add(subject + course_id)
			
	return render(request, 'index.html', {"sections": sections})


def get_schedules(request):
	if request.POST:
		# gets the relevant schedule request data from the post request
		schedule_request_data = json.loads(request.POST["courses_info"])
		wish_list = schedule_request_data["wish_list"]
		filters = schedule_request_data["filters"]

		if wish_list:  # if there are courses in the wish list, send the possible schedules
			schedules, courses_info = Interface.compute_schedules(list(wish_list.values()), filters)
			return JsonResponse({"schedules": schedules, "coursesInfo": courses_info}, safe=False)
		else:  # returns a default value if no courses were provided
			return JsonResponse({"schedules": [], "coursesInfo": {}}, safe=False)
	else:
		return HttpResponse("Da fuck are you tryin' to do?")