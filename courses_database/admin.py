from django.contrib import admin

# imports the models
from .models import Section

# makes the admins for the models
class SectionAdmin(admin.ModelAdmin):
	list_display = ['crn', 'title', 'course_id', 'section_number']


# adds the models to the site
admin.site.register(Section, SectionAdmin)
