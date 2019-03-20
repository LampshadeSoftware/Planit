import urllib.request
from bs4 import BeautifulSoup

import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Planit.settings")
django.setup()

# import the django module
from courses_database.models import Section

SUBJECT_SELECT_URL = 'https://courselist.wm.edu/courselist/'
COURSE_LIST_URL = 'https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code={}&term_subj={}&attr=0&attr2=0&levl=0&status=0&ptrm=0&search=Search'
ADDITIONAL_INFO_URL = "https://courselist.wm.edu/courselist/courseinfo/addInfo?fterm={}&fcrn={}"

"""
WARNING, This code is sloppy... The tables were not neatly arranged on the WAM website.
"""

headers = ['crn', 'course_id', 'course_attr', 'title', 'instructor', 'credit_hrs', 'meet_time',
           'projected_enr', 'curr_enr', 'seats_avail', 'status']


def save_course(section, subj):
	"""
	Separate save method in case we change the way that we're saving objects
	"""
	setattr(section, "subject", subj)
	section.save()


def get_additional_info(crn, current_section, term):
	"""
	:param crn: the crn of the section we want the additional info from
	:param current_section: the Section object to which add the extra info
	:param term: the current term to search
	:return: Void, it simply adds additional course info to the mutable object "current_section"
	We do this in a separate function because the additional info comes from a different url
	"""
	url = ADDITIONAL_INFO_URL.format(term, crn)
	try:
		html = urllib.request.urlopen(url).read()
		soup = BeautifulSoup(html, 'html.parser')
		description = soup.find_all("td")[0].text.split(" -- ")[2].strip()
		location = soup.find_all("td")[-1].text
		
		setattr(current_section, "description", description)
		setattr(current_section, "location", location)
	except:
		#TODO: when this is an automatic update, have it send us an email that it failed
		print("Had an issue getting the info for the url: ", url)
		html = urllib.request.urlopen(url).read()
		raise Exception


def save_courses_for_subj(subj, term):
	"""
	:param subj: The 4-character subject code as defined by WAM! example: CSCI
	:param term: the year/term
	:return: None, updates the database only
	"""
	url = COURSE_LIST_URL.format(term, subj)
	html = urllib.request.urlopen(url).read()
	soup = BeautifulSoup(html, 'html.parser')
	
	entries = soup.find_all('td')
	current_section = None
	crn = None
	for i, entry in enumerate(entries):  # goes through every entry in the table. Every 11 entries is 1 section
		if i % len(headers) > 6:  # we don't need the any of the remaining columns
			continue
		
		# The column header for the data we're currently getting. See headers array for what a headers there are
		header = headers[i % len(headers)]
		# Entry is a column in the table.
		# The entry column contains information corresponding to our current header
		entry = entry.contents
		
		if i % len(headers) == 0:  # We've looped back around to the first header, meaning this is a new section
			entry = entry[1].string
			if current_section is not None:  # save the previous section before making a new one
				get_additional_info(crn, current_section, term)
				save_course(current_section, subj)
			current_section = Section()  # creates a blank Section
		else:
			entry = entry[0].replace(u'\xa0 ', '').strip()  # remove unicode representation of spaces
			
		# Special formatting for specific table entries
		if header == "crn":  # converts the crn to an int
			crn = int(entry.strip("*"))
			entry = int(entry.strip("*"))
		elif header == "course_id":
			course_id, section_number = entry.strip().split(" ")[1:]
			setattr(current_section, "course_id", course_id)
			setattr(current_section, "section_number", section_number)
			continue
		
		# add the attribute to the current_section that we're on
		setattr(current_section, header, entry)
	
	if current_section is not None:  # this just adds the last section since the for loop doesn't save the last one
		get_additional_info(crn, current_section, term)
		save_course(current_section, subj)


def get_all_subject_courses():
	html = urllib.request.urlopen(SUBJECT_SELECT_URL).read()
	soup = BeautifulSoup(html, 'html.parser')
	
	# ensures we are using the most up-to-date term
	all_terms = {x.contents[0]: x['value'] for x in soup.find('select', {'name': 'term_code'}).findAll('option')}
	non_summer_terms = []  # sorted by date (oldest first)
	for term in all_terms:
		if "Summer" not in term:
			non_summer_terms.append(all_terms[term])
	
	subj_codes = [x['value'] for x in soup.find('select', {'name': 'term_subj'}).findAll('option')[1:]]
	
	for subj_code in subj_codes:  # all the subjects are at different urls so this just goes through them all
		print("getting courses for subject code: {}".format(subj_code))
		save_courses_for_subj(subj_code, non_summer_terms[-1])


print("Starting...")
get_all_subject_courses()
print("Done!")
