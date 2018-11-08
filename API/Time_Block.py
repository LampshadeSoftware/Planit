
class Time_Block:
	"""
	Represents a specific block of time in a week.
	For reference, msm = minutes since midnight.
	"""

	DAYS = ['M', 'T', 'W', 'R', 'F']

	@classmethod
	def get_time_blocks(cls, day_time_str):
		"""
		Generates a list of Time_Block objects from the format given in the
		W&M course database.

		Parameters:
		day_time_str (string): A string representing the days and time (ex: time_str = 'MWF:1000-1050')

		Returns:
		list(Time_Block): a list of time blocks, repeating the start/end times for the given days
		"""

		blocks = []
		
		for time_str in day_time_str.split(" "):
			if ':' in time_str:
				colon_index = time_str.index(':')
				days = time_str[:colon_index]
				
				start_time = time_str[-9:-5]
				end_time = time_str[-4:]
				
				for day in days:
					blocks.append(Time_Block(start_time, end_time, day))
	
		return blocks

	@classmethod
	def convert_readable_to_msm(cls, readable):
		"""
		Converts a time string in military time to the number of minutes since midnight.

		Inverse operation of convert_msm_to_readable.

		Parameters:
		time_str (string): The time in military time (ex: 1430)

		Returns:
		int: Number of minutes since midnight (ex: 870)
		"""

		hour = int(readable[:2])
		minute = int(readable[2:])
		time = hour * 60 + minute

		return time

	@classmethod
	def convert_msm_to_readable(cls, msm):
		"""
		Converts a 'minutes since midnight' into military time.

		Inverse operation of convert_readable_to_msm.

		Parameters:
		time (int): The number of minutes since midnight

		Returns:
		"""

		return format((msm // 60), '02d') + format((msm % 60), '02d')


	def __init__(self, start_str, end_str, day):
		"""
		Parameters:
		start_str (string): A military time string of the start of the time block
		end_str (string): A military time string of the end of the time block
		day (string): The letter corresponding to a day, one of (M, T, W, R, F)
		"""

		self._start = Time_Block.convert_readable_to_msm(start_str)
		self._end = Time_Block.convert_readable_to_msm(end_str)

		self._day_index = Time_Block.DAYS.index(day)

	def __str__(self):
		""" String representation of this time block (ex: M: 1000-1050) """

		out = Time_Block.DAYS[self._day_index]
		out += ": " + Time_Block.convert_msm_to_readable(self._start)
		out += "-" + Time_Block.convert_msm_to_readable(self._end)
		return out

	def get_start(self):
		"""
		Returns:
		int: MSM value of start time of this time block
		"""

		return self._start

	def get_end(self):
		"""
		Returns:
		int: MSM value of end time of this time block
		"""

		return self._end

	def get_day_char(self):
		"""
		Returns:
		string: The character representing the day of this time block (ex: M)
		"""

		return Time_Block.DAYS[self._day_index]

	def get_day_index(self):
		"""
		Returns:
		int: The number of the day of this time block (ex, if day is M: 0)
		"""

		return self._day_index

	def get_as_dict(self):
		"""
		Converts this object into a dictionary to be passed between services.

		Returns:
		dict: Dictionary representation with keys:
			day -> int
			start_hour -> string
			start_minute -> string
			end_hour -> string
			end_minute -> string
		"""

		out = dict()
		out['day'] = self.get_day_index() + 1

		readable_start = Time_Block.convert_msm_to_readable(self._start)
		out['start_hour'] = readable_start[:2]
		out['start_minute'] = readable_start[2:]

		readable_end = Time_Block.convert_msm_to_readable(self._end)
		out['end_hour'] = readable_end[:2]
		out['end_minute'] = readable_end[2:]

		return out

	def overlaps(self, other_block):
		"""
		Determines if this time block overlaps another time block.

		Parameters:
		other_block (Time_Block): The other time block to be compared to

		Returns:
		bool: True if the two time blocks occupy some amount of the same time,
		False if they are completely disjoint
		"""

		if self._day_index != other_block._day_index:
			return False

		if self._start < other_block._start:
			if self._end < other_block._start:
				return False
			else:
				return True
		else:
			if self._start < other_block._end:
				return True
			else:
				return False

	def starts_after(self, time_str):
		"""
		Parameters:
		time_str (string): Time represented in military time

		Returns:
		bool: True if this time block starts after the given time, false if not
		"""

		return self._start >= Time_Block.convert_readable_to_msm(time_str)

	def ends_before(self, time_str):
		"""
		Parameters:
		time_str (string): Time represented in military time

		Returns:
		bool: True if this time block ends before the given time, false if not
		"""

		return self._end <= Time_Block.convert_readable_to_msm(time_str)
