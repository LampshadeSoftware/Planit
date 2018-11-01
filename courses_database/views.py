from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.core import serializers
from .models import Section
import API.Interface as Interface
import json


def index(request):
	"""
	The home screen of the app that displays the calendar and lets users add courses and sort through schedules
	:return:
			sections (array): an array of courses used to populate the data table
			courses_info (dictionary): a dictionary that maps "subject + course_id" to relevant course information (descriptions, etc.)
	"""
	unique_sections = set()
	sections = []
	courses_info = {}
	sections_of_courses = {}
	for section in Section.objects.all():
		subject, course_id = section.subject, section.course_id
		# makes sure that we don't add multiple sections for the same class
		if len(section.meet_time) == 0:
			continue

		section_dict = {
			"section_number": section.section_number,
			"instructor": section.instructor,
			"meet_time": section.meet_time,
			"location": section.location
		}
		if subject + course_id not in unique_sections:
			sections.append(section)
			unique_sections.add(subject + course_id)
			# TODO: also add other stuff to this dictionary like professors and section times
			courses_info[subject + course_id] = {
				"description": section.description,
				"credits": section.credit_hrs,
				"attributes": section.course_attr
			}

			sections_of_courses[subject + course_id] = [section_dict]
		else:
			sections_of_courses[subject + course_id].append(section_dict)

	return render(request, 'index.html', {"sections": sections, "sections_of_courses": sections_of_courses, "courses_info": json.dumps(courses_info)})


def get_schedules(request):
	"""
	Called by AJAX in background to populate the calendar full of schedules
	:return:
			schedules (dict): this structure is super complex (see Slack), but basically it contains the schedules
			schedules_info (dict): maps "subject + course_id" to string descriptions of that course
	"""
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
	"""
	(NOT CURRENTLY BEING USED)
	Used to populate the data tables when using AJAX instead of Django template tags
	:return: sections_list (json array): array of dicts representing sections
	"""
	# TODO: IF you use this function, make sure to only add unique courses, not every section
	sections_list = Section.objects.all()
	json_sections = serializers.serialize("json", sections_list)
	return HttpResponse(json_sections, content_type='application/json')
