'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Search } from 'lucide-react';
import { MessageCard } from '@/components/outreach/message-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OutreachMessage, MessageStatus, MessageType } from '@/types/outreach';
import type { ResearchedLead } from '@/types/research';

export default function OutreachPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [leads, setLeads] = useState<Record<string, ResearchedLead>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MessageType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc'>('created_at_desc');

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, sortBy, searchQuery]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sort', sortBy);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('message_type', typeFilter);
      if (searchQuery) params.append('search_query', searchQuery);

      const response = await fetch(`/api/outreach/messages?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.messages || []);

      // Fetch lead names for messages
      const uniqueLeadIds = [...new Set(data.messages.map((m: OutreachMessage) => m.lead_id))] as string[];
      const leadsData: Record<string, ResearchedLead> = {};

      await Promise.all(
        uniqueLeadIds.map(async (leadId: string) => {
          try {
            const leadResponse = await fetch(`/api/research/${leadId}`);
            if (leadResponse.ok) {
              const leadData = await leadResponse.json();
              leadsData[leadId] = leadData.lead;
            }
          } catch (err) {
            console.error('Failed to fetch lead:', leadId, err);
          }
        })
      );

      setLeads(leadsData);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const response = await fetch(`/api/outreach/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');

      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete message');
    }
  };

  const handleView = (messageId: string) => {
    router.push(`/outreach/${messageId}`);
  };

  const handleEdit = (messageId: string) => {
    router.push(`/outreach/${messageId}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Outreach Messages</h1>
          <p className="text-gray-600 mt-1">Manage your personalized outreach</p>
        </div>
        <Button onClick={() => router.push('/research/leads')}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as MessageStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="clicked">Clicked</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div>
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as MessageType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="call_script">Call Script</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'created_at_desc' | 'created_at_asc')}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-6">
              Start by generating personalized outreach for your leads.
            </p>
            <Button onClick={() => router.push('/research/leads')}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Your First Message
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              leadName={leads[message.lead_id]?.person_name || undefined}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
