from API.Section import *
from API.TimeBlock import *
import django
django.setup()
from courses_database.models import Section


class API_Course:
	"""
	Represents one course, which may have multiple sections taught by different
	professors.
	"""

	def __init__(self, subject, course_id):
		"""
		Parameters:
		subject (string): The subject acronym for this course (ex: CSCI)
		course_id (string): The course number (ex: 141)
		"""

		self._subject = subject
		self._course_id = course_id
		self._attributes = set()

		# Get all the sections whose subject and course id match the given parameters
		django_obj_set = Section.objects.all().filter(subject=subject, course_id=course_id)

		# If we have found at least section that matches...
		if len(django_obj_set) > 0:

			# Pull info that is the same across all sections from database
			self._name = django_obj_set[0].title
			self._credits = int(django_obj_set[0].credit_hrs)

			for attr in django_obj_set[0].course_attr.split(','):
				self._attributes.add(attr)

		# Create section objects for all sections of this course and store in list
		self._sections = []
		for section in django_obj_set:
			time_blocks = TimeBlock.get_time_blocks(section.meet_time)
			sec_object = API_Section(self, section.crn, section.section_number, time_blocks, section.title)
			self._sections.append(sec_object)

	def get_subject(self):
		"""
		Returns:
		string: The subject identifier of this course (ex: CSCI)
		"""

		return self._subject

	def get_course_id(self):
		"""
		Returns:
		string: The course number for this course (ex: 141)
		"""

		return self._course_id

	def get_sections(self):
		"""
		Returns:
		list(API_Section): The specific sections of this course in which a student
		could enroll
		"""

		return self._sections

	def get_num_credits(self):
		"""
		Returns:
		int: The number of credit hours awarded by completing this course
		"""
		return self._credits

	def has_attribute(self, attribute):
		"""
		Returns a boolean that represents whether or not this course contains
		the given attribute.

		Parameters:
		attribute (string): An attribute identifier (ex: NQR)

		Returns:
		bool: True if the course has the attribute, false if not
		"""

		return attribute in self._attributes

	def __str__(self):
		""" String representation of the course (ex: CSCI 141) """
		
		return str(self._subject) + " " + str(self._course_id)
