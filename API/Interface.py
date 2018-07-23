import os
import sys
import django
django.setup()

from API.User import *

# your imports, e.g. Django models
from courses_database.models import Section

from API.Section import *
from API.Time_Block import *


def compute_schedules(wish_list, filters):
	"""
	:param wish_list: should be a list of dictionaries where each dictionary has subject, course_id, and title as keys
	:param filters:
	:return:
	"""
	user = API_User()

	colors = ["#46B8AF", "#5869CE", "#CE5858", "#BD4EAC", "#F0962A", "#5DC15D", "#975DC1"]
	colors_dict = {}
	courses_info = {}  # gets all additional info that we need like colors and descriptions
	for i, course in enumerate(wish_list):

		subject = str(course['subject'])
		course_id = str(course['course_id'])
		colors_dict[subject + course_id] = colors[i % len(colors)]

		course_object = Section.objects.all().filter(subject=subject, course_id=course_id)[0]
		courses_info.setdefault(subject + course_id, {})
		courses_info[subject+course_id]["color"] = colors[i % len(colors)]
		courses_info[subject+course_id]["description"] = course_object.description

		user.add_to_wish_list(str(course['subject']), str(course['course_id']), optional=course['optional'])

	# apply filters
	for key in filters:
		# print("Receiving filter - {" + str(key) + ": " + str(filters[key]) + "}")
		if len(filters[key]) > 0:
			user.set_filter(key, filters[key])
		pass

	out = user.get_interface_output(colors_dict)
	schedules = out["schedules"]
	used_courses = out["used_courses"]

	for course in courses_info:
		if course not in used_courses:
			del courses_info[course]["color"]

	return schedules, courses_info