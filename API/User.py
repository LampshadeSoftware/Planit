from API.Course import *
from API.Schedule import *


class API_User:
	""" Defines operations that a user might request """

	def __init__(self):

		# list of API_Course objects that the user might like to take
		self._wish_list = dict()

		# dictionary of filters for the possible schedules
		self._filters = dict()

		self._filters['earliest_time'] = None
		self._filters['latest_time'] = None

		self._filters['credit_min'] = 1
		self._filters['credit_max'] = 18

		self._filters['forbidden_days'] = set()

		self._filters['desired_attributes'] = set()

		# keeps track of all of the courses that actually end up in a possible schedule
		self._used_courses = set()


	def set_filter(self, filter, value):
		"""
		Writes the given filter and value to the internal filter dict.

		Parameters:
		filter (string): The filter to modify
		value (variable type): The value to set that filter
		"""

		if filter == 'start_time':
			self._set_filter_earliest_time(Time_Block.convert_msm_to_readable(int(value)))

		elif filter == 'end_time':
			self._set_filter_latest_time(Time_Block.convert_msm_to_readable(int(value)))

		elif filter == 'min_credits':
			self._set_filter_credit_min(value)

		elif filter == 'max_credits':
			self._set_filter_credit_max(value)

		elif filter == 'days_off':
			days = value.split(',')
			for day in days:
				self._set_filter_forbidden_days(day, True)

		elif filter == 'attr':
			attributes = value.split(',')
			for attr in attributes:
				self._set_filter_desired_attributes(attr, True)


	def _set_filter_earliest_time(self, time):
		self._filters['earliest_time'] = str(time)

	def _set_filter_latest_time(self, time):
		self._filters['latest_time'] = str(time)

	def _set_filter_credit_min(self, amount):
		self._filters['credit_min'] = int(amount)

	def _set_filter_credit_max(self, amount):
		self._filters['credit_max'] = int(amount)

	def _set_filter_forbidden_days(self, day, value):
		if value:
			self._filters['forbidden_days'].add(day)
		elif day in self._filters['forbidden_days']:
			self._filters['forbidden_days'].remove(day)

	def _set_filter_desired_attributes(self, attribute, value):
		if value:
			self._filters['desired_attributes'].add(attribute)
		else:
			self._filters['desired_attributes'].remove(attribute)


	def add_to_wish_list(self, subject, course_id, optional=True, sections=None):
		"""
		Adds a course to the wish list.

		Parameters:
		subject (string): The subject id of the course (ex: CSCI)
		course_id (string): The number of the course (ex: 141)
		optional (bool, optional): Whether or not this course may be omitted
		when computing potential schedules.
		"""


		key = str(subject) + str(course_id)
		if key not in self._wish_list:
			course = API_Course(subject, course_id)

			if sections is None:
				sections_to_consider = course.get_sections()
			else:
				sections = set(sections)
				sections_to_consider = []
				for section in course.get_sections():
					if section in sections:
						sections_to_consider.append(section)

			self._wish_list[key] = {"course": course,
									"optional": optional,
									"sections": sections_to_consider}
		else:
			pass
			# print(key + " already in wish list")

	def set_course_optional(self, subject, course_id, value):
		"""
		Sets whether or not the course may be omitted

		Parameters:
		subject (string): The subject id of the course (ex: CSCI)
		course_id (string): The number of the course (ex: 141)
		value: (bool): Whether or not this course may be omitted
		"""

		key = str(subject) + str(course_id)
		if key in self._wish_list:
			self._wish_list[key]["optional"] = value

	def get_need_list(self):
		"""
		Returns all courses in the wishlist that are not optional.

		Returns:
		list([API_Course, bool]): A list of two element lists, where the first
		element is the API_Course object, and the second element is a boolean
		representing whether or not it is optional
		"""

		need_list = []

		for course_id in self._wish_list:
			if not self._wish_list[course_id]["optional"]:
				need_list.append(self._wish_list[course_id]["course"])

		return need_list

	def get_want_list(self):
		"""
		Returns all courses in the wishlist that are optional.

		Returns:
		list([API_Course, bool]): A list of two element lists, where the first
		element is the API_Course object, and the second element is a boolean
		representing whether or not it is optional
		"""

		want_list = []

		for course_id in self._wish_list:
			if self._wish_list[course_id]["optional"]:
				want_list.append(self._wish_list[course_id]["course"])

		return want_list

	def get_all_schedules(self):
		"""
		Computes all possible schedules given the current wishlist and filters.

		Returns:
		list(API_Schedule): A list of all the possible schedules
		"""

		# start with an empty schedule
		schedule = API_Schedule()

		# start recursive function
		return self._get_all_schedules_recursive(schedule, self.get_need_list(), False)

	def _get_all_schedules_recursive(self, locked_schedule, course_list, optional):
		"""
		Recursively computes all schedules that can be created from an existing schedule.

		Parameters:
		locked_schedule (API_Schedule): The base schedule from which to build
		course_list (list(API_Course)): The list of courses which have not been considered yet
		optional (bool): If true, course_list contains optional courses. If false,
		course_list contains required classes
		"""

		possible_schedules = []

		# If there are no more courses to add, there are two options
		if len(course_list) == 0:
			# If the courses we added were the required courses, we can now begin to add the optional courses
			if not optional:
				return self._get_all_schedules_recursive(locked_schedule, self.get_want_list(), True)

			# Otherwise, we were adding optional courses, and we are now finished
			else:
				if self.schedule_passes_final_filters(locked_schedule):
					# update used courses set
					self._used_courses.update(locked_schedule.get_course_set())
					return [locked_schedule]
				else:
					return []

		if optional:
			# add all derivative schedules that do not contain the top class on the wish list
			all_schedules_without = self._get_all_schedules_recursive(locked_schedule, course_list[1:], True)
			possible_schedules += all_schedules_without

		course = course_list[0]
		sections = course.get_sections()

		# for each potential section of this course...
		for section in sections:
			# if this section adheres to the filters...
			if self.section_passes_intermediate_filters(section):
				# make a copy of the previous schedule
				new_schedule = locked_schedule.copy()

				# try to add the new section. if it fails, ignore it and continue
				if not new_schedule.add_section(section):
					continue

				# if this new schedule passes the intermediate filters...
				if self.schedule_passes_intermediate_filters(new_schedule):

					# add all derivative schedules that DO contain this section
					all_schedules_with = self._get_all_schedules_recursive(new_schedule, course_list[1:], optional)
					possible_schedules += all_schedules_with

		return possible_schedules



	def section_passes_intermediate_filters(self, section):
		"""
		Parameters:
		section (API_Section): The section to consider

		Returns:
		bool: True if the given section is allowed through the filters, false if not
		"""

		# time interval is correct and doesn't occur on forbidden days
		for time_block in section.get_time_blocks():

			if self._filters['earliest_time'] is not None and not time_block.starts_after(self._filters['earliest_time']):
				return False

			if self._filters['latest_time'] is not None and not time_block.ends_before(self._filters['latest_time']):
				return False

			if time_block.get_day_char() in self._filters['forbidden_days']:
				return False

		return True

	def schedule_passes_intermediate_filters(self, schedule):
		"""
		Parameters:
		schedule (API_Schedule): The schedule to consider

		Returns:
		bool: True if the given schedule is allowed through the filters, false if
		the given schedule and all its derivative schedules are not allowed through the filters
		"""

		# check that schedule has less than max credits
		if self._filters['credit_max'] is not None and schedule.total_credits() > self._filters['credit_max']:
			return False

		return True

	def schedule_passes_final_filters(self, schedule):
		"""
		Parameters:
		schedule (API_Schedule): The schedule to consider

		Returns:
		bool: True if the given schedule is allowed through the filters, false if
		the given schedule is not allowed through the filters, however a derivative
		of this schedule MAY pass the filters
		"""

		# check that schedule has more than min credits
		if self._filters['credit_min'] is not None and schedule.total_credits() < self._filters['credit_min']:
			return False

		# check for all desired attributes
		for a in self._filters['desired_attributes']:
			for section in schedule.get_sections():
				if section.get_course().has_attribute(a):
					break
			else:
				return False

		return True

	def get_all_schedules_as_dicts(self):
		"""
		Converts all the possible schedules into lists of dictionaries that can be
		passed between services.

		Returns:
		list(dict): The list of schedules, where each schedule is a dictionary
		containing information about the schedule (see Schedule.py for keys)
		"""

		out = []
		for sched in self.get_all_schedules():
			out.append(sched.convert_to_dict())

		return out

	def get_interface_output(self, colors_dict):
		"""
		Returns information about the possible schedules, and corresponding colors
		of the courses that appear in one or more schedules.

		Parameters:
		colors_dict (dict): Maps a course id + course num (ex: CSCI 141) to a color in hex

		Returns:
		dict: Information dictionary with keys:
			schedules -> list
			used_courses -> dict
		"""

		schedules = self.get_all_schedules_as_dicts()
		used_courses = dict()
		for key in self._used_courses:
			used_courses[key] = dict()
			used_courses[key]['color'] = colors_dict[key]

		return {'schedules': schedules, 'used_courses': used_courses}
