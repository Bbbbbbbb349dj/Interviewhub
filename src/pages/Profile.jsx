import React, { useState } from 'react';
import { Save, User, GraduationCap, Briefcase, Wrench, Trophy } from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, Badge, Field, Input, Textarea, Select } from '../components/ui';
import { FEATURES, ROLES } from '../constants';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../services/gamification';

export default function Profile() {
  const { user, updateProfile, toast, stats, achievements } = useApp();
  const [form, setForm] = useState({
    name: user?.name || '',
    targetRole: user?.profile?.targetRole || '',
    skills: (user?.profile?.skills || []).join(', '),
    education: user?.profile?.education || '',
    bio: user?.profile?.bio || '',
  });

  const save = () => {
    updateProfile({
      name: form.name.trim() || user.name,
      profile: {
        targetRole: form.targetRole,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        education: form.education.trim(),
        bio: form.bio.trim(),
      },
    });
    toast('success', 'Profile saved');
  };

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Page>
      <Container className="max-w-4xl space-y-6 pt-8">
        <FeatureHeader feature="practice" title="Your Profile" desc="This drives personalization across interviews, resume analysis and recommendations." />

        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-5">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 via-pink-500 to-orange-400 font-display text-2xl font-bold text-white shadow-lg">{initials}</span>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user?.profile?.targetRole && <Badge className={`${FEATURES.interview.soft} ${FEATURES.interview.text}`}><Briefcase size={11} /> {user.profile.targetRole}</Badge>}
                <Badge className="bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"><Trophy size={11} /> {achievements.length}/{ACHIEVEMENTS.length} achievements</Badge>
                <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Target role">
              <Select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                <option value="">Select a role…</option>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Skills" hint="Comma-separated, e.g. React, Node.js, SQL">
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, SQL" />
            </Field>
            <Field label="Education">
              <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="B.Tech CSE, Class of 2026" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Short bio">
                <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What are you preparing for?" />
              </Field>
            </div>
          </div>
          <Btn className="mt-6" icon={Save} onClick={save}>Save profile</Btn>
        </Card>

        {/* Lifetime stats from real data */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { f: FEATURES.interview, l: 'Interviews completed', v: stats.interviews.count },
            { f: FEATURES.coding, l: 'Code submissions', v: stats.coding.total },
            { f: FEATURES.aptitude, l: 'Aptitude questions', v: stats.aptitude.total },
            { f: FEATURES.communication, l: 'Speaking sessions', v: stats.comm.count },
          ].map((s) => (
            <Card key={s.l} className={`p-5 ${s.f.soft}`}>
              <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.f.grad} text-white`}><s.f.icon size={17} /></span>
              <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">{s.v}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.l}</p>
            </Card>
          ))}
        </div>

        {user?.profile?.skills?.length > 0 && (
          <Card className="p-6">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 dark:text-white"><Wrench size={17} className="text-teal-500" /> Your skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.profile.skills.map((s) => <Badge key={s} className="bg-teal-500/10 text-teal-700 dark:text-teal-300">{s}</Badge>)}
            </div>
          </Card>
        )}
      </Container>
    </Page>
  );
}
