from API.Time_Block import *
from random import choice

class API_Schedule:
	"""
	Represents a specific potential schedule, with a set of class sections that
	do not conflict with each other.
	"""

	def __init__(self):
		self._sections = set()
		self._num_credits = 0


	def add_section(self, new_section):
		"""
		Attempt to add a new section to this schedule. If there is a conflict
		with the existing sections, the section will not be added.

		Parameters:
		new_section (API_Section): The new section to be added

		Returns:
		bool: True if the add was successful, false if not
		"""

		# check that the class we are trying to add does not overlap with
		# any sections that already exist in this schedule
		for existing_section in self._sections:
			if existing_section.overlaps(new_section):
				# print("Not adding " + str(new_section) + ". Overlaps with " + str(existing_section))
				return False

		# add section to set and increment credit count
		self._sections.add(new_section)
		self._num_credits += new_section.get_course().get_num_credits()
		return True

	def total_credits(self):
		"""
		Returns:
		int: The sum of all credits of courses in this schedule
		"""

		return self._num_credits

	def get_sections(self):
		"""
		Returns:
		list(API_Section): The section objects represented by this schedule
		"""

		return list(self._sections)

	def get_course_set(self):
		"""
		Iterates over every section in the internal sections list and compiles
		a set of the course identifiers (ex: 'CSCI 141') of each of the sections.

		Returns:
		set(string): The course identifiers of the courses represented by this schedule
		"""

		out = set()
		for section in self._sections:
			course = section.get_course()
			subject = course.get_subject()
			id = course.get_course_id()

			key = subject + id

			out.add(key)
		return out


	def __eq__(self, other_schedule):
		"""
		Determines the equality of this schedule to another schedule.

		Parameters:
		other_schedule (API_Schedule): The schedule object to compare to this one.

		Returns:
		bool: True if the schedules contain exactly the same sections, false if not
		"""

		if len(self._sections) != len(other_schedule._sections):
			return False

		for section in self._sections:
			if section not in other_schedule._sections:
				return False

		return True


	def copy(self):
		"""
		Creates a new API_Schedule object with the same sections

		Returns:
		API_Schedule: A reference to the new identical schedule
		"""

		new = API_Schedule()
		new._sections = self._sections.copy()
		new._num_credits = self._num_credits
		return new


	def __str__(self):
		"""
		String representation of the schedule for debugging.

		Lists each day and the sections and times for that day.
		"""

		out = ""
		for day in Time_Block.DAYS:
			out += str(day) + "\n"
			out += "---------\n"
			for section in self._sections:
				blocks = section.get_time_blocks_on_day(day)
				if len(blocks) > 0:
					out += str(section) + " -- "
					for time_block in blocks:
						out += str(time_block) + "\n"
			out += "\n"
		return out


	def convert_to_dict(self):
		"""
		Converts this object into a list of dictionaries that can be passed between services.

		Returns:
		dict: A dictionary representing information about the schedule, with keys:
			total_credits -> int
			sections -> dict, with keys:
				subject -> string
				course_id -> string
				title -> string
				section_num -> string
				crn -> int
				num_credits -> int
				times -> list(dict) (see Time_Block.py for keys)
		"""

		sched = dict()
		sched['total_credits'] = self.total_credits()

		sections = dict()

		for section in self._sections:

			section_dict = dict()
			section_dict['subject'] = section.get_course().get_subject()
			section_dict['course_id'] = section.get_course().get_course_id()
			section_dict['title'] = section.get_title()
			section_dict['section_num'] = section.get_section_number()
			section_dict['crn'] = section.get_crn()
			section_dict['num_credits'] = section.get_course().get_num_credits()
			section_dict['times'] = [x.get_as_dict() for x in section.get_time_blocks()]

			key = section_dict['subject'] + section_dict['course_id']
			sections[key] = section_dict

		sched['sections'] = sections

		return sched
