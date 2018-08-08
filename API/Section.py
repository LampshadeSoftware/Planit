
class API_Section:
	"""
	Represents a specific section of a course.
	"""

	def __init__(self, course, crn, section_number, time_blocks, title):
		"""
		Parameters:
		crn (int): The course registration number
		course (API_Course): Course object representing the course that this section teaches
		section_number (string): number of section (ex: 1)
		time_blocks (list(Time_Block)): list of Time_Block objects representing the times that the section meets
		"""

		self._crn = crn
		self._course = course
		self._section_number = section_number

		self._time_blocks = time_blocks
		self._title = title


	def overlaps(self, other_section):
		"""
		Determines whether a section's time conflicts with this section's.

		Returns:
		bool: True if both sections cannot be taken simultaneously, false if they can
		"""

		for time_block in self._time_blocks:
			for other_time_block in other_section._time_blocks:
				if time_block.overlaps(other_time_block):
					return True

		return False

	def get_time_blocks(self):
		"""
		Returns:
		list(Time_Block): The blocks of time that this section meets each week
		"""

		return self._time_blocks

	def get_time_blocks_on_day(self, day):
		"""
		Parameters:
		day (string): A day character (M, T, W, R, F)

		Returns:
		list(Time_Block): The blocks of time that this section meets on the given day
		"""

		out = []
		for time_block in self._time_blocks:
			if time_block.get_day_char() == day:
				out.append(time_block)
		return out

	def get_course(self):
		"""
		Returns:
		API_Course: The course object of this section
		"""

		return self._course

	def get_crn(self):
		"""
		Returns:
		int: The course registration number
		"""

		return self._crn

	def get_section_number(self):
		"""
		Returns:
		string: The section number
		"""
		return self._section_number

	def get_title(self):
		"""
		Returns:
		string: The title of the section (Note: in most cases, sections will have
		the same title if they are in the same course, but this may not be true
		in cases like seminar classes, where different professors teach different
		things)
		"""
		return self._title

	def __str__(self):
		""" String representation of this section (ex: CSCI 141 1) """
		return str(self._course) + " " + str(self._section_number)
