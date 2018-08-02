from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.core import serializers
from .models import Section
import API.Interface as Interface
import json


def index(request):
	unique_sections = set()
	sections = []
	for section in Section.objects.all():
		subject, course_id = section.subject, section.course_id
		# makes sure that we don't add multiple sections for the same class
		if subject + course_id not in unique_sections:
			sections.append(section)
			unique_sections.add(subject + course_id)
			
	return render(request, 'index.html', {"sections": sections})


def get_schedules(request):
	if request.POST:
		# gets the relevant schedule request data from the post request
		schedule_restrictions = json.loads(request.POST["schedule_restrictions"])
		wish_list = schedule_restrictions["wish_list"]
		filters = schedule_restrictions["filters"]

		if wish_list:  # if there are courses in the wish list, send the possible schedules
			schedules, schedules_info = Interface.compute_schedules(list(wish_list.values()), filters)
			return JsonResponse({"schedules": schedules, "schedules_info": schedules_info}, safe=False)
		else:  # returns a default value if no courses were provided
			return JsonResponse({"schedules": [], "schedules_info": {}}, safe=False)
	else:
		return HttpResponse("Da fuck are you tryin' to do?")
	
	
def get_sections(request):
	sections_list = Section.objects.all()
	json_sections = serializers.serialize("json", sections_list)
	return HttpResponse(json_sections, content_type='application/json')